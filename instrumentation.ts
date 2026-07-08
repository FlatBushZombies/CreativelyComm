export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // This dev/hosting environment resolves Supabase's Postgres host to an
    // IPv6 address by default, which times out (ETIMEDOUT) before falling
    // back to IPv4. Better Auth's `pg.Pool` (lib/auth/auth.ts) connects on
    // server boot and on every request, so force IPv4 resolution globally
    // before any connection is attempted.
    const dns = await import("dns");
    dns.setDefaultResultOrder("ipv4first");
  }
}
