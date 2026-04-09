"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  GmaoImportBatchStatus,
  GmaoImportMode,
  GmaoImportRowStatus,
  GmaoImportType,
  type Prisma,
} from "@prisma/client";

import { suggestMapping, validateMappingCompleteness } from "@/lib/gmao-import/field-registry";
import {
  buildAssetUpsertArgs,
  parseEquipmentRow,
} from "@/lib/gmao-import/equipment-import";
import { mapExcelRowToNormalized } from "@/lib/gmao-import/map-row";
import { readSheetMatrix, listSheetNames } from "@/lib/gmao-import/parse-workbook";
import { GMAO_IMPORT_ALLOWED_EXT, GMAO_IMPORT_MAX_FILE_BYTES } from "@/lib/gmao-import/constants";
import { saveGmaoImportBuffer } from "@/lib/gmao-import/storage";
import { prisma } from "@/lib/prisma";
import { requireWritableUserId } from "@/lib/portal-actions";

async function loadBatchForProject(batchId: string, projectId: string, userId: string) {
  const batch = await prisma.gmaoImportBatch.findFirst({
    where: { id: batchId, projectId },
  });
  if (!batch) return null;
  if (batch.createdById !== userId) {
    return null;
  }
  return batch;
}

function extOf(name: string): string {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i).toLowerCase() : "";
}

/** Prisma JSON columns expect InputJsonValue; plain objects from parsing need a narrow cast. */
function asJsonInput(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

export async function gmaoImportStartAction(formData: FormData) {
  const userId = await requireWritableUserId();
  const projectId = String(formData.get("projectId") ?? "").trim();
  const importTypeRaw = String(formData.get("importType") ?? "").trim();
  if (!projectId) redirect("/portal/projects");

  const importType = importTypeRaw as GmaoImportType;
  if (!Object.values(GmaoImportType).includes(importType)) {
    redirect(`/portal/projects/${projectId}/gmao/import?err=type`);
  }
  if (importType !== GmaoImportType.EQUIPMENT_INVENTORY) {
    redirect(`/portal/projects/${projectId}/gmao/import?err=type-not-ready`);
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    redirect(`/portal/projects/${projectId}/gmao/import?err=file`);
  }
  if (file.size > GMAO_IMPORT_MAX_FILE_BYTES) {
    redirect(`/portal/projects/${projectId}/gmao/import?err=size`);
  }
  const ext = extOf(file.name);
  if (!GMAO_IMPORT_ALLOWED_EXT.has(ext)) {
    redirect(`/portal/projects/${projectId}/gmao/import?err=ext`);
  }

  const project = await prisma.project.findFirst({
    where: { id: projectId, archivedAt: null },
    select: { id: true },
  });
  if (!project) redirect("/portal/projects");

  const batchId = randomUUID();
  const buf = Buffer.from(await file.arrayBuffer());
  const storagePath = await saveGmaoImportBuffer(batchId, buf);

  await prisma.gmaoImportBatch.create({
    data: {
      id: batchId,
      projectId,
      importType,
      status: GmaoImportBatchStatus.UPLOADED,
      fileName: file.name,
      storagePath,
      createdById: userId,
    },
  });

  revalidatePath(`/portal/projects/${projectId}/gmao/import`);
  redirect(`/portal/projects/${projectId}/gmao/import/${batchId}`);
}

export async function gmaoImportConfigureSheetAction(formData: FormData) {
  const userId = await requireWritableUserId();
  const projectId = String(formData.get("projectId") ?? "").trim();
  const batchId = String(formData.get("batchId") ?? "").trim();
  const sheetName = String(formData.get("sheetName") ?? "").trim();
  const headerRow = Math.max(1, Number.parseInt(String(formData.get("headerRow") ?? "1"), 10) || 1);

  const batch = await loadBatchForProject(batchId, projectId, userId);
  if (!batch) redirect(`/portal/projects/${projectId}/gmao/import?err=batch`);

  const names = await listSheetNames(batch.storagePath);
  if (!names.includes(sheetName)) {
    redirect(`/portal/projects/${projectId}/gmao/import/${batchId}?err=sheet`);
  }

  await prisma.gmaoImportBatch.update({
    where: { id: batchId },
    data: {
      sheetName,
      headerRow,
      status: GmaoImportBatchStatus.MAPPING,
    },
  });

  revalidatePath(`/portal/projects/${projectId}/gmao/import/${batchId}`);
  redirect(`/portal/projects/${projectId}/gmao/import/${batchId}?step=mapping`);
}

export async function gmaoImportSaveMappingAction(formData: FormData) {
  const userId = await requireWritableUserId();
  const projectId = String(formData.get("projectId") ?? "").trim();
  const batchId = String(formData.get("batchId") ?? "").trim();
  const mappingJson = String(formData.get("mappingJson") ?? "").trim();
  const modeRaw = String(formData.get("mode") ?? "UPSERT").trim() as GmaoImportMode;
  const dedupeStrategy = String(formData.get("dedupeStrategy") ?? "code").trim();

  const batch = await loadBatchForProject(batchId, projectId, userId);
  if (!batch || !batch.sheetName) {
    redirect(`/portal/projects/${projectId}/gmao/import?err=batch`);
  }

  const mode = Object.values(GmaoImportMode).includes(modeRaw) ? modeRaw : GmaoImportMode.UPSERT;

  let mapping: Record<string, string | null>;
  try {
    mapping = JSON.parse(mappingJson) as Record<string, string | null>;
  } catch {
    redirect(`/portal/projects/${projectId}/gmao/import/${batchId}?err=mapping-json`);
  }

  const check = validateMappingCompleteness(mapping, batch.importType);
  if (!check.ok) {
    redirect(`/portal/projects/${projectId}/gmao/import/${batchId}?err=required&fields=${check.missing.join(",")}`);
  }

  await prisma.gmaoImportBatch.update({
    where: { id: batchId },
    data: {
      mappingSnapshotJson: mapping,
      mode,
      dedupeStrategy,
      status: GmaoImportBatchStatus.VALIDATED,
    },
  });

  revalidatePath(`/portal/projects/${projectId}/gmao/import/${batchId}`);
  redirect(`/portal/projects/${projectId}/gmao/import/${batchId}?step=validate`);
}

export async function gmaoImportRunValidateAction(formData: FormData) {
  const userId = await requireWritableUserId();
  const projectId = String(formData.get("projectId") ?? "").trim();
  const batchId = String(formData.get("batchId") ?? "").trim();

  const batch = await loadBatchForProject(batchId, projectId, userId);
  if (!batch?.sheetName || !batch.mappingSnapshotJson) {
    redirect(`/portal/projects/${projectId}/gmao/import/${batchId}?err=batch`);
  }

  const mapping = batch.mappingSnapshotJson as Record<string, string | null>;

  const { headers, dataRows } = await readSheetMatrix(batch.storagePath, batch.sheetName, batch.headerRow);

  await prisma.gmaoImportRow.deleteMany({ where: { batchId } });

  const seenCodes = new Map<string, number>();
  let rowIndex = 0;

  for (const raw of dataRows) {
    rowIndex += 1;
    const rawJson = raw as Record<string, unknown>;
    const rawForDb = asJsonInput(raw);

    if (batch.importType !== GmaoImportType.EQUIPMENT_INVENTORY) {
      await prisma.gmaoImportRow.create({
        data: {
          batchId,
          rowIndex,
          rawJson: rawForDb,
          status: GmaoImportRowStatus.ERROR,
          errorCode: "TYPE_NOT_IMPLEMENTED",
          errorMessage: `Type d'import ${batch.importType} : moteur non encore branche.`,
        },
      });
      continue;
    }

    const normalized = mapExcelRowToNormalized(rawJson, mapping);
    const parsed = parseEquipmentRow(normalized);
    if (!parsed.ok) {
      await prisma.gmaoImportRow.create({
        data: {
          batchId,
          rowIndex,
          rawJson: rawForDb,
          normalizedJson: asJsonInput(normalized),
          status: GmaoImportRowStatus.ERROR,
          errorCode: "VALIDATION",
          errorMessage: parsed.message,
        },
      });
      continue;
    }

    const code = parsed.data.code;
    const firstLine = seenCodes.get(code);
    if (firstLine !== undefined) {
      await prisma.gmaoImportRow.create({
        data: {
          batchId,
          rowIndex,
          rawJson: rawForDb,
          normalizedJson: asJsonInput(parsed.data),
          status: GmaoImportRowStatus.ERROR,
          errorCode: "DUPLICATE_IN_FILE",
          errorMessage: `Doublon du code ${code} (premiere ligne ${firstLine}).`,
        },
      });
      continue;
    }
    seenCodes.set(code, rowIndex);

    await prisma.gmaoImportRow.create({
      data: {
        batchId,
        rowIndex,
        rawJson: rawForDb,
        normalizedJson: asJsonInput(parsed.data),
        status: GmaoImportRowStatus.VALID,
      },
    });
  }

  const counts = await prisma.gmaoImportRow.groupBy({
    by: ["status"],
    where: { batchId },
    _count: { id: true },
  });
  const stats: Record<string, number> = {};
  for (const c of counts) stats[c.status] = c._count.id;

  await prisma.gmaoImportBatch.update({
    where: { id: batchId },
    data: {
      status: GmaoImportBatchStatus.PREVIEWED,
      statsJson: { ...stats, headerCount: headers.length, dataRowCount: dataRows.length },
    },
  });

  revalidatePath(`/portal/projects/${projectId}/gmao/import/${batchId}`);
  redirect(`/portal/projects/${projectId}/gmao/import/${batchId}?step=preview`);
}

export async function gmaoImportCommitAction(formData: FormData) {
  const userId = await requireWritableUserId();
  const projectId = String(formData.get("projectId") ?? "").trim();
  const batchId = String(formData.get("batchId") ?? "").trim();
  const dryRun = String(formData.get("dryRun") ?? "") === "1";

  const batch = await loadBatchForProject(batchId, projectId, userId);
  if (!batch || batch.status !== GmaoImportBatchStatus.PREVIEWED) {
    redirect(`/portal/projects/${projectId}/gmao/import/${batchId}?err=state`);
  }

  if (batch.importType !== GmaoImportType.EQUIPMENT_INVENTORY) {
    redirect(`/portal/projects/${projectId}/gmao/import/${batchId}?err=type`);
  }

  await prisma.gmaoImportBatch.update({
    where: { id: batchId },
    data: { status: GmaoImportBatchStatus.RUNNING, startedAt: new Date(), dryRun },
  });

  const rows = await prisma.gmaoImportRow.findMany({
    where: { batchId, status: GmaoImportRowStatus.VALID },
    orderBy: { rowIndex: "asc" },
  });

  let created = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const row of rows) {
    const normalized = row.normalizedJson as Record<string, unknown> | null;
    if (!normalized) {
      errors += 1;
      await prisma.gmaoImportRow.update({
        where: { id: row.id },
        data: { status: GmaoImportRowStatus.ERROR, errorCode: "INTERNAL", errorMessage: "normalizedJson manquant" },
      });
      continue;
    }

    const parsed = parseEquipmentRow(normalized);
    if (!parsed.ok) {
      errors += 1;
      await prisma.gmaoImportRow.update({
        where: { id: row.id },
        data: {
          status: GmaoImportRowStatus.ERROR,
          errorCode: "VALIDATION",
          errorMessage: parsed.message,
        },
      });
      continue;
    }

    const existing = await prisma.asset.findUnique({
      where: { code: parsed.data.code },
      select: { id: true },
    });

    const plan = buildAssetUpsertArgs(parsed.data, projectId, batch.mode, existing);
    if (plan.skip) {
      skipped += 1;
      await prisma.gmaoImportRow.update({
        where: { id: row.id },
        data: {
          status: GmaoImportRowStatus.SKIPPED,
          errorCode: "SKIP",
          errorMessage: plan.reason,
        },
      });
      continue;
    }

    if (dryRun) {
      if (plan.op === "create") created += 1;
      else updated += 1;
      continue;
    }

    try {
      if (plan.op === "create") {
        await prisma.asset.create({ data: plan.args as Prisma.AssetCreateInput });
        created += 1;
      } else {
        await prisma.asset.update({
          where: { code: parsed.data.code },
          data: plan.args as Prisma.AssetUpdateInput,
        });
        updated += 1;
      }
      const asset = await prisma.asset.findUnique({
        where: { code: parsed.data.code },
        select: { id: true },
      });
      await prisma.gmaoImportRow.update({
        where: { id: row.id },
        data: { status: GmaoImportRowStatus.APPLIED, entityId: asset?.id ?? null },
      });
    } catch {
      errors += 1;
      await prisma.gmaoImportRow.update({
        where: { id: row.id },
        data: {
          status: GmaoImportRowStatus.ERROR,
          errorCode: "DB",
          errorMessage: "Erreur base de donnees a l'ecriture.",
        },
      });
    }
  }

  const finalStatus = dryRun
    ? GmaoImportBatchStatus.PREVIEWED
    : errors === 0
      ? GmaoImportBatchStatus.SUCCESS
      : created + updated + skipped > 0
        ? GmaoImportBatchStatus.PARTIAL
        : GmaoImportBatchStatus.FAILED;

  await prisma.gmaoImportBatch.update({
    where: { id: batchId },
    data: {
      status: finalStatus,
      finishedAt: new Date(),
      statsJson: dryRun
        ? { dryRun: true, simulatedCreated: created, simulatedUpdated: updated, skipped, errors }
        : { created, updated, skipped, errors, dryRun: false },
    },
  });

  revalidatePath(`/portal/projects/${projectId}/gmao/import/${batchId}`);
  revalidatePath(`/portal/projects/${projectId}/assets`);
  revalidatePath(`/portal/projects/${projectId}/gmao`);
  revalidatePath("/portal/assets");
  revalidatePath("/portal");

  redirect(`/portal/projects/${projectId}/gmao/import/${batchId}?step=done`);
}

export async function gmaoImportSaveTemplateAction(formData: FormData) {
  const userId = await requireWritableUserId();
  const projectId = String(formData.get("projectId") ?? "").trim();
  const batchId = String(formData.get("batchId") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;

  if (!name || name.length > 120) {
    redirect(`/portal/projects/${projectId}/gmao/import/${batchId}?err=template-name`);
  }

  const batch = await loadBatchForProject(batchId, projectId, userId);
  if (!batch?.mappingSnapshotJson) {
    redirect(`/portal/projects/${projectId}/gmao/import/${batchId}?err=batch`);
  }

  await prisma.gmaoImportTemplate.create({
    data: {
      name,
      description,
      projectId,
      importType: batch.importType,
      mappingJson: batch.mappingSnapshotJson,
      dedupeKey: batch.dedupeStrategy,
      headerRow: batch.headerRow,
      defaultMode: batch.mode,
      createdById: userId,
    },
  });

  revalidatePath(`/portal/projects/${projectId}/gmao/import/${batchId}`);
  redirect(`/portal/projects/${projectId}/gmao/import/${batchId}?ok=template`);
}

/** Suggestion auto : en-têtes → champs (JSON pour le formulaire client). */
export async function gmaoImportSuggestMappingJson(headersJson: string, importType: GmaoImportType) {
  await requireWritableUserId();
  let headers: string[];
  try {
    headers = JSON.parse(headersJson) as string[];
  } catch {
    return {};
  }
  if (!Object.values(GmaoImportType).includes(importType)) return {};
  return suggestMapping(headers, importType);
}

export async function gmaoImportTemplateMapping(templateId: string, projectId: string) {
  await requireWritableUserId();
  const t = await prisma.gmaoImportTemplate.findFirst({
    where: {
      id: templateId,
      OR: [{ projectId }, { projectId: null }],
    },
    select: { mappingJson: true },
  });
  return t?.mappingJson ?? null;
}

