import { GmaoImportMode } from "@prisma/client";
import { z } from "zod";

import { ENTITY_CODE_PATTERN, normalizeWhitespace } from "@/lib/form-validators";
import type { Prisma } from "@prisma/client";

import { GMAO_IMPORT_DEFAULT_CATEGORY } from "./constants";

const ALLOWED_STATUS = new Set(["OPERATIONAL", "MAINTENANCE", "OUT_OF_SERVICE", "RETIRED"]);

export const equipmentNormalizedSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1),
  location: z.string().nullable().optional(),
  site: z.string().nullable().optional(),
  model: z.string().nullable().optional(),
  manufacturer: z.string().nullable().optional(),
  serialNumber: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
});

export type EquipmentNormalized = z.infer<typeof equipmentNormalizedSchema>;

function rawCategoryFromNormalized(normalized: Record<string, unknown>): string {
  if (!Object.prototype.hasOwnProperty.call(normalized, "category")) return "";
  return normalizeWhitespace(String(normalized.category ?? ""));
}

/** Au moins 2 caractères utiles pour considérer la catégorie comme fournie (sinon défaut + fusion MERGE sans toucher la catégorie). */
export function categorySuppliedFromNormalized(normalized: Record<string, unknown>): boolean {
  return rawCategoryFromNormalized(normalized).length >= 2;
}

export function parseEquipmentRow(normalized: Record<string, unknown>): {
  ok: true;
  data: EquipmentNormalized;
  categorySupplied: boolean;
} | { ok: false; message: string } {
  const pre = {
    code: String(normalized.code ?? "").trim().toUpperCase(),
    name: normalizeWhitespace(String(normalized.name ?? "")),
    location: normalized.location != null && normalized.location !== "" ? normalizeWhitespace(String(normalized.location)) : null,
    site: normalized.site != null && normalized.site !== "" ? normalizeWhitespace(String(normalized.site)) : null,
    model: normalized.model != null && normalized.model !== "" ? normalizeWhitespace(String(normalized.model)) : null,
    manufacturer:
      normalized.manufacturer != null && normalized.manufacturer !== ""
        ? normalizeWhitespace(String(normalized.manufacturer))
        : null,
    serialNumber:
      normalized.serialNumber != null && normalized.serialNumber !== ""
        ? String(normalized.serialNumber).trim()
        : null,
    status:
      normalized.status != null && normalized.status !== ""
        ? String(normalized.status).trim().toUpperCase()
        : null,
  };

  const categorySupplied = categorySuppliedFromNormalized(normalized);
  const rawCat = rawCategoryFromNormalized(normalized);
  const category = categorySupplied ? rawCat : GMAO_IMPORT_DEFAULT_CATEGORY;

  if (!ENTITY_CODE_PATTERN.test(pre.code)) {
    return { ok: false, message: "Format de code invalide (2-64 caractères alphanumériques, - ou _)." };
  }
  if (pre.name.length < 3) {
    return { ok: false, message: "Libellé trop court (min. 3 caractères)." };
  }

  const status = pre.status && ALLOWED_STATUS.has(pre.status) ? pre.status : "OPERATIONAL";
  const parsed = equipmentNormalizedSchema.safeParse({
    ...pre,
    category,
    status,
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues.map((i) => i.message).join("; ") };
  }
  return { ok: true, data: parsed.data, categorySupplied };
}

/** JSON stocké en base : sans clé `category` si non fournie, pour que le commit MERGE sache ne pas écraser. */
export function equipmentNormalizedJsonForStorage(data: EquipmentNormalized, categorySupplied: boolean): Record<string, unknown> {
  const base: Record<string, unknown> = {
    code: data.code,
    name: data.name,
    location: data.location ?? null,
    site: data.site ?? null,
    model: data.model ?? null,
    manufacturer: data.manufacturer ?? null,
    serialNumber: data.serialNumber ?? null,
    status: data.status ?? "OPERATIONAL",
  };
  if (categorySupplied) base.category = data.category;
  return base;
}

export function buildAssetUpsertArgs(
  data: EquipmentNormalized,
  projectId: string,
  mode: GmaoImportMode,
  existing: { id: string } | null,
  opts?: { categorySupplied: boolean },
): { skip: true; reason: string } | { skip: false; op: "create" | "update"; args: Prisma.AssetCreateInput | Prisma.AssetUpdateInput } {
  const categorySupplied = opts?.categorySupplied ?? true;

  const baseCreate: Prisma.AssetCreateInput = {
    code: data.code,
    name: data.name,
    category: data.category,
    location: data.location ?? null,
    site: data.site ?? null,
    model: data.model ?? null,
    manufacturer: data.manufacturer ?? null,
    serialNumber: data.serialNumber ?? null,
    status: data.status ?? "OPERATIONAL",
    project: { connect: { id: projectId } },
    archivedAt: null,
  };

  if (!existing) {
    if (mode === GmaoImportMode.UPDATE_ONLY) {
      return { skip: true, reason: "UPDATE_ONLY: équipement absent en base" };
    }
    return { skip: false, op: "create", args: baseCreate };
  }

  if (mode === GmaoImportMode.CREATE_ONLY) {
    return { skip: true, reason: "CREATE_ONLY: code déjà présent" };
  }

  if (mode === GmaoImportMode.MERGE) {
    const u: Prisma.AssetUpdateInput = {
      name: data.name,
      project: { connect: { id: projectId } },
      archivedAt: null,
    };
    if (categorySupplied) u.category = data.category;
    if (data.location != null) u.location = data.location;
    if (data.site != null) u.site = data.site;
    if (data.model != null) u.model = data.model;
    if (data.manufacturer != null) u.manufacturer = data.manufacturer;
    if (data.serialNumber != null) u.serialNumber = data.serialNumber;
    if (data.status != null) u.status = data.status;
    return { skip: false, op: "update", args: u };
  }

  // UPSERT / UPDATE_ONLY update branch
  const u: Prisma.AssetUpdateInput = {
    name: data.name,
    category: data.category,
    location: data.location ?? null,
    site: data.site ?? null,
    model: data.model ?? null,
    manufacturer: data.manufacturer ?? null,
    serialNumber: data.serialNumber ?? null,
    status: data.status ?? "OPERATIONAL",
    project: { connect: { id: projectId } },
    archivedAt: null,
  };
  return { skip: false, op: "update", args: u };
}
