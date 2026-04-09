import { GmaoImportType } from "@prisma/client";

export type GmaoTargetField = {
  key: string;
  label: string;
  required: boolean;
  /** Normalisés en minuscules pour suggestion auto */
  synonyms?: string[];
};

const EQUIPMENT_FIELDS: GmaoTargetField[] = [
  { key: "code", label: "Code équipement", required: true, synonyms: ["code", "ref", "reference", "id", "numero"] },
  { key: "name", label: "Libellé / désignation", required: true, synonyms: ["name", "nom", "designation", "libelle"] },
  { key: "category", label: "Catégorie", required: true, synonyms: ["category", "categorie", "famille", "type"] },
  { key: "location", label: "Localisation", required: false, synonyms: ["location", "localisation", "lieu"] },
  { key: "site", label: "Site", required: false, synonyms: ["site"] },
  { key: "model", label: "Modèle", required: false, synonyms: ["model", "modele"] },
  { key: "manufacturer", label: "Marque / fabricant", required: false, synonyms: ["manufacturer", "marque", "fabricant", "constructeur"] },
  { key: "serialNumber", label: "N° de série", required: false, synonyms: ["serial", "serie", "n° serie", "numero serie"] },
  {
    key: "status",
    label: "Statut (OPERATIONAL, MAINTENANCE, OUT_OF_SERVICE, RETIRED)",
    required: false,
    synonyms: ["status", "statut", "etat"],
  },
];

export function getTargetFieldsForImportType(t: GmaoImportType): GmaoTargetField[] {
  if (t === GmaoImportType.EQUIPMENT_INVENTORY) return EQUIPMENT_FIELDS;
  return [];
}

export function suggestMapping(
  excelHeaders: string[],
  importType: GmaoImportType,
): Record<string, string | null> {
  const fields = getTargetFieldsForImportType(importType);
  const used = new Set<string>();
  const out: Record<string, string | null> = {};
  const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

  for (const h of excelHeaders) {
    const n = norm(h);
    let best: string | null = null;
    for (const f of fields) {
      if (used.has(f.key)) continue;
      if (norm(f.key) === n || norm(f.label) === n) {
        best = f.key;
        break;
      }
      const syns = f.synonyms?.map(norm) ?? [];
      if (syns.some((s) => n === s || n.includes(s) || s.includes(n))) {
        best = f.key;
        break;
      }
    }
    if (best) used.add(best);
    out[h] = best;
  }
  return out;
}

export function validateMappingCompleteness(
  mapping: Record<string, string | null>,
  importType: GmaoImportType,
): { ok: true } | { ok: false; missing: string[] } {
  const fields = getTargetFieldsForImportType(importType);
  const required = fields.filter((f) => f.required).map((f) => f.key);
  const mapped = new Set(
    Object.values(mapping).filter((v): v is string => typeof v === "string" && v.length > 0),
  );
  const missing = required.filter((k) => !mapped.has(k));
  if (missing.length) return { ok: false, missing };
  return { ok: true };
}
