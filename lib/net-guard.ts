import dns from "node:dns";
import https from "node:https";
import net from "node:net";
import zlib from "node:zlib";
import type { IncomingMessage } from "node:http";

// SSRF-safe outbound fetch for user-supplied hostnames (the public audit).
// The block decision is made on the address the socket will actually connect
// to (a custom `lookup`), not on a separate pre-flight resolve -- so a DNS
// rebind between "check" and "connect" can't smuggle in an internal address.

/** Error whose message is safe to show to an anonymous visitor. */
export class GuardedFetchError extends Error {}

function parseIPv4(ip: string): number[] | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  const octets = parts.map((p) => (/^\d{1,3}$/.test(p) ? Number(p) : NaN));
  return octets.every((o) => o >= 0 && o <= 255) ? octets : null;
}

function isBlockedIPv4(o: number[]): boolean {
  const [a, b, c] = o;
  return (
    a === 0 || // "this" network
    a === 10 || // private
    (a === 100 && b >= 64 && b <= 127) || // carrier-grade NAT
    a === 127 || // loopback
    (a === 169 && b === 254) || // link-local, incl. cloud metadata 169.254.169.254
    (a === 172 && b >= 16 && b <= 31) || // private
    (a === 192 && b === 0 && c === 0) || // IETF protocol assignments
    (a === 192 && b === 0 && c === 2) || // documentation
    (a === 192 && b === 88 && c === 99) || // 6to4 relay
    (a === 192 && b === 168) || // private
    (a === 198 && (b === 18 || b === 19)) || // benchmarking
    (a === 198 && b === 51 && c === 100) || // documentation
    (a === 203 && b === 0 && c === 113) || // documentation
    a >= 224 // multicast, reserved, broadcast
  );
}

function parseIPv6(ip: string): number[] | null {
  let s = ip.split("%")[0].toLowerCase();
  const v4tail = /(\d+\.\d+\.\d+\.\d+)$/.exec(s);
  if (v4tail) {
    const o = parseIPv4(v4tail[1]);
    if (!o) return null;
    s = s.slice(0, -v4tail[1].length) + ((o[0] << 8) | o[1]).toString(16) + ":" + ((o[2] << 8) | o[3]).toString(16);
  }
  const halves = s.split("::");
  if (halves.length > 2) return null;
  const head = halves[0] ? halves[0].split(":") : [];
  const tail = halves.length === 2 && halves[1] ? halves[1].split(":") : [];
  const missing = 8 - head.length - tail.length;
  if (halves.length === 1 ? missing !== 0 : missing < 0) return null;
  const groups = [...head, ...Array<string>(Math.max(missing, 0)).fill("0"), ...tail];
  if (groups.length !== 8) return null;
  const values = groups.map((g) => (/^[0-9a-f]{1,4}$/.test(g) ? parseInt(g, 16) : NaN));
  return values.every((v) => Number.isInteger(v)) ? values : null;
}

/** True for any address a public-web fetch must never reach (private, loopback, link-local, metadata, reserved). Unparseable input is blocked. */
export function isBlockedAddress(ip: string): boolean {
  const v4 = parseIPv4(ip);
  if (v4) return isBlockedIPv4(v4);

  const g = parseIPv6(ip);
  if (!g) return true;

  // IPv4-mapped (::ffff:a.b.c.d) -- judge by the embedded IPv4 address.
  if (g.slice(0, 5).every((x) => x === 0) && g[5] === 0xffff) {
    return isBlockedIPv4([g[6] >> 8, g[6] & 255, g[7] >> 8, g[7] & 255]);
  }

  // Allow only global unicast (2000::/3), then carve out special-purpose ranges inside it.
  if ((g[0] & 0xe000) !== 0x2000) return true;
  if (g[0] === 0x2001 && g[1] < 0x0200) return true; // 2001::/23 protocol assignments (Teredo, ORCHID, ...)
  if (g[0] === 0x2001 && g[1] === 0x0db8) return true; // documentation
  if (g[0] === 0x2002) return true; // 6to4 (embeds an IPv4 address)
  if (g[0] === 0x3fff && g[1] < 0x1000) return true; // documentation
  return false;
}

/** Normalizes user input ("https://Shop.com/products/x") to a bare public hostname, or explains why it can't be audited. */
export function normalizePublicDomain(input: string): { ok: true; domain: string } | { ok: false; error: string } {
  let raw = input.trim();
  if (!raw) return { ok: false, error: "Enter your store's web address, e.g. mystore.com." };
  raw = raw.replace(/^[a-z][a-z0-9+.-]*:\/\//i, "");
  raw = raw.split(/[/?#]/)[0];
  if (raw.includes("@")) return { ok: false, error: "That doesn't look like a store address." };
  if (/:\d+$/.test(raw)) {
    if (!raw.endsWith(":443")) return { ok: false, error: "Only standard https stores can be audited." };
    raw = raw.slice(0, -4);
  }

  let host: string;
  try {
    host = new URL(`https://${raw}`).hostname.replace(/\.$/, "");
  } catch {
    return { ok: false, error: "That doesn't look like a store address." };
  }

  if (net.isIP(host) || host.startsWith("[")) {
    return { ok: false, error: "Enter a store domain name, not an IP address." };
  }
  if (host.length > 253 || !/^([a-z0-9-]{1,63}\.)+[a-z][a-z0-9-]{1,62}$/.test(host)) {
    return { ok: false, error: "That doesn't look like a valid store domain." };
  }
  if (/\.(local|localhost|internal|lan|home|corp|onion|test|invalid|example)$/.test(host)) {
    return { ok: false, error: "That address isn't a public website." };
  }
  return { ok: true, domain: host };
}

type LookupCallback = (err: NodeJS.ErrnoException | null, address: string | dns.LookupAddress[], family?: number) => void;

function guardedLookup(hostname: string, options: dns.LookupOptions, callback: LookupCallback): void {
  dns.lookup(hostname, { ...options, all: true }, (err, addresses) => {
    if (err) return callback(err, "");
    const list = addresses as dns.LookupAddress[];
    if (list.length === 0 || list.some((a) => isBlockedAddress(a.address))) {
      return callback(new GuardedFetchError("That address isn't a public website."), "");
    }
    if (options.all) return callback(null, list);
    callback(null, list[0].address, list[0].family);
  });
}

interface FetchLimits {
  timeoutMs: number;
  maxBytes: number;
  maxRedirects: number;
}

const DEFAULT_LIMITS: FetchLimits = { timeoutMs: 8000, maxBytes: 5 * 1024 * 1024, maxRedirects: 3 };

function readBody(res: IncomingMessage, maxBytes: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const encoding = String(res.headers["content-encoding"] ?? "").toLowerCase();
    let stream: NodeJS.ReadableStream = res;
    if (encoding === "gzip") stream = res.pipe(zlib.createGunzip());
    else if (encoding === "deflate") stream = res.pipe(zlib.createInflate());
    else if (encoding === "br") stream = res.pipe(zlib.createBrotliDecompress());

    const chunks: Buffer[] = [];
    let size = 0;
    stream.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > maxBytes) {
        res.destroy();
        reject(new GuardedFetchError("That store's product feed is too large to audit."));
        return;
      }
      chunks.push(chunk);
    });
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    stream.on("error", () => reject(new GuardedFetchError("Couldn't read that store's response.")));
  });
}

function requestOnce(url: URL, limits: FetchLimits): Promise<{ status: number; location: string | null; body: string }> {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        host: url.hostname,
        port: 443,
        path: `${url.pathname}${url.search}`,
        method: "GET",
        agent: false,
        lookup: guardedLookup as unknown as net.LookupFunction,
        timeout: limits.timeoutMs,
        headers: {
          accept: "application/json",
          "accept-encoding": "gzip, identity",
          "user-agent": "CreativelyCommAudit/1.0",
        },
      },
      (res) => {
        const status = res.statusCode ?? 0;
        if (status >= 300 && status < 400) {
          res.resume();
          resolve({ status, location: (res.headers.location as string | undefined) ?? null, body: "" });
          return;
        }
        readBody(res, limits.maxBytes).then((body) => resolve({ status, location: null, body }), reject);
      }
    );
    req.on("timeout", () => req.destroy(new GuardedFetchError("That store took too long to respond.")));
    req.on("error", (err) => {
      reject(err instanceof GuardedFetchError ? err : new GuardedFetchError("Couldn't reach that store."));
    });
    req.end();
  });
}

/**
 * GET `https://{domain}{path}` with SSRF protection: https + port 443 only,
 * connect-time address validation on every hop, at most a few redirects (each
 * re-validated as a public https host), an 8s timeout and a 5 MB body cap.
 */
export async function fetchPublicText(
  domain: string,
  path: string,
  overrides: Partial<FetchLimits> = {}
): Promise<{ status: number; body: string }> {
  const limits = { ...DEFAULT_LIMITS, ...overrides };
  let url = new URL(`https://${domain}${path}`);

  for (let hop = 0; hop <= limits.maxRedirects; hop++) {
    const result = await requestOnce(url, limits);
    if (result.status < 300 || result.status >= 400) {
      return { status: result.status, body: result.body };
    }
    if (!result.location) throw new GuardedFetchError("That store redirected somewhere we couldn't follow.");

    let next: URL;
    try {
      next = new URL(result.location, url);
    } catch {
      throw new GuardedFetchError("That store redirected somewhere we couldn't follow.");
    }
    const normalized = next.protocol === "https:" && (next.port === "" || next.port === "443") && !next.username && !next.password
      ? normalizePublicDomain(next.hostname)
      : null;
    if (!normalized || !normalized.ok) {
      throw new GuardedFetchError("That store redirected somewhere we couldn't follow.");
    }
    url = new URL(`https://${normalized.domain}${next.pathname}${next.search}`);
  }
  throw new GuardedFetchError("That store redirected too many times.");
}
