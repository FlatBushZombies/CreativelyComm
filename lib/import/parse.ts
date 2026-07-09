import Papa from "papaparse";

export interface ParsedProductRow {
  name: string;
  description: string;
  price: number;
  category: string;
  sku?: string;
  tags: string[];
  imageUrl?: string;
}

export interface ParseProductsCsvResult {
  rows: ParsedProductRow[];
  errors: string[];
}

/**
 * Parses a CSV matching lib/import/template.ts's PRODUCT_IMPORT_COLUMNS.
 * Invalid rows are skipped and reported in `errors` rather than failing the
 * whole import — a handful of bad rows shouldn't block the good ones.
 */
export function parseProductsCsv(csvText: string): ParseProductsCsvResult {
  const { data, errors: parseErrors } = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase().replace(/\s+/g, "_"),
  });

  const errors: string[] = parseErrors.map(
    (e) => `Row ${(e.row ?? 0) + 2}: ${e.message}`
  );
  const rows: ParsedProductRow[] = [];

  data.forEach((record, index) => {
    const rowNumber = index + 2; // +1 for 0-index, +1 for header row
    const name = (record.name ?? "").trim();
    if (!name) {
      errors.push(`Row ${rowNumber}: missing "name" — skipped.`);
      return;
    }

    const priceRaw = (record.price ?? "").trim();
    let price = 0;
    if (priceRaw) {
      const parsed = Number(priceRaw);
      if (Number.isNaN(parsed) || parsed < 0) {
        errors.push(`Row ${rowNumber}: invalid price "${priceRaw}" — used 0 instead.`);
      } else {
        price = parsed;
      }
    }

    const tags = (record.tags ?? "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    rows.push({
      name,
      description: (record.description ?? "").trim(),
      price,
      category: (record.category ?? "").trim(),
      sku: record.sku?.trim() || undefined,
      tags,
      imageUrl: record.image_url?.trim() || undefined,
    });
  });

  return { rows, errors };
}
