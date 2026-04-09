import { readFile } from "node:fs/promises";
import * as XLSX from "xlsx";

import { GMAO_IMPORT_MAX_DATA_ROWS } from "@/lib/gmao-import/constants";

export async function listSheetNames(absPath: string): Promise<string[]> {
  const buf = await readFile(absPath);
  const wb = XLSX.read(buf, { type: "buffer", cellDates: true });
  return wb.SheetNames;
}

function cellToPrimitive(v: unknown): string | number | boolean | null {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "boolean") return v;
  if (v instanceof Date) return v.toISOString();
  if (typeof v === "string") return v.trim() || null;
  return String(v);
}

/**
 * Lit une feuille : ligne d'en-tête (1-based) puis jusqu'à maxDataRows lignes de données.
 */
export async function readSheetMatrix(
  absPath: string,
  sheetName: string,
  headerRow1Based: number,
): Promise<{ headers: string[]; dataRows: Record<string, unknown>[] }> {
  const buf = await readFile(absPath);
  const wb = XLSX.read(buf, { type: "buffer", cellDates: true });
  const sheet = wb.Sheets[sheetName];
  if (!sheet) {
    throw new Error(`Feuille introuvable: ${sheetName}`);
  }

  const aoa = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: null,
    raw: false,
  }) as unknown[][];

  const headerIdx = headerRow1Based - 1;
  if (headerIdx < 0 || headerIdx >= aoa.length) {
    throw new Error("Ligne d'en-tête hors plage");
  }

  const headerRow = aoa[headerIdx] ?? [];
  const rawHeaders = headerRow.map((cell, c) => {
    const v = cellToPrimitive(cell);
    return v === null ? `COL_${c + 1}` : String(v);
  });
  const count = new Map<string, number>();
  const headersFinal: string[] = [];
  for (const h of rawHeaders) {
    const n = (count.get(h) ?? 0) + 1;
    count.set(h, n);
    headersFinal.push(n === 1 ? h : `${h}_${n}`);
  }

  const dataRows: Record<string, unknown>[] = [];
  const maxRow = Math.min(aoa.length, headerIdx + 1 + GMAO_IMPORT_MAX_DATA_ROWS);
  for (let r = headerIdx + 1; r < maxRow; r += 1) {
    const row = aoa[r] ?? [];
    const obj: Record<string, unknown> = {};
    let any = false;
    for (let c = 0; c < headersFinal.length; c += 1) {
      const key = headersFinal[c];
      const val = cellToPrimitive(row[c]);
      if (val !== null) any = true;
      obj[key] = val;
    }
    if (any) dataRows.push(obj);
  }

  return { headers: headersFinal, dataRows };
}
