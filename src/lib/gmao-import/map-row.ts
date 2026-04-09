/**
 * Applique le mapping { [colonne Excel]: clé cible | null } sur une ligne brute.
 */
export function mapExcelRowToNormalized(
  rawRow: Record<string, unknown>,
  mapping: Record<string, string | null>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [excelCol, targetKey] of Object.entries(mapping)) {
    if (!targetKey) continue;
    if (!(excelCol in rawRow)) continue;
    const v = rawRow[excelCol];
    if (v === null || v === undefined || v === "") continue;
    out[targetKey] = typeof v === "string" ? v.trim() : v;
  }
  return out;
}
