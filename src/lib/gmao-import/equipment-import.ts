import { GmaoImportMode } from "@prisma/client";
import { z } from "zod";

import { ENTITY_CODE_PATTERN, normalizeWhitespace } from "@/lib/form-validators";
import type { Prisma } from "@prisma/client";

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

export function parseEquipmentRow(normalized: Record<string, unknown>): {
  ok: true;
  data: EquipmentNormalized;
} | { ok: false; message: string } {
  const pre = {
    code: String(normalized.code ?? "").trim().toUpperCase(),
    name: normalizeWhitespace(String(normalized.name ?? "")),
    category: normalizeWhitespace(String(normalized.category ?? "")),
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

  if (!ENTITY_CODE_PATTERN.test(pre.code)) {
    return { ok: false, message: "Format de code invalide (2-64 caractères alphanumériques, - ou _)." };
  }
  if (pre.name.length < 3) {
    return { ok: false, message: "Libellé trop court (min. 3 caractères)." };
  }
  if (pre.category.length < 2) {
    return { ok: false, message: "Catégorie invalide." };
  }

  const status = pre.status && ALLOWED_STATUS.has(pre.status) ? pre.status : "OPERATIONAL";
  const parsed = equipmentNormalizedSchema.safeParse({ ...pre, status });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues.map((i) => i.message).join("; ") };
  }
  return { ok: true, data: { ...parsed.data, status } };
}

export function buildAssetUpsertArgs(
  data: EquipmentNormalized,
  projectId: string,
  mode: GmaoImportMode,
  existing: { id: string } | null,
): { skip: true; reason: string } | { skip: false; op: "create" | "update"; args: Prisma.AssetCreateInput | Prisma.AssetUpdateInput } {
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
      category: data.category,
      project: { connect: { id: projectId } },
      archivedAt: null,
    };
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
