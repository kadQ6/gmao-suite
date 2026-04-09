import { GmaoImportBatchStatus, GmaoImportType } from "@prisma/client";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { GmaoImportMappingForm } from "@/components/portal/gmao-import-mapping-form";
import {
  gmaoImportCommitAction,
  gmaoImportConfigureSheetAction,
  gmaoImportRunValidateAction,
  gmaoImportSaveTemplateAction,
} from "@/lib/gmao-import-actions";
import { getTargetFieldsForImportType, suggestMapping } from "@/lib/gmao-import/field-registry";
import { readSheetMatrix, listSheetNames } from "@/lib/gmao-import/parse-workbook";
import { getPortalContext } from "@/lib/portal-scope";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ projectId: string; batchId: string }>;
  searchParams: Promise<{ step?: string; err?: string; ok?: string; fields?: string }>;
};

export default async function GmaoImportBatchPage({ params, searchParams }: Props) {
  const { projectId, batchId } = await params;
  const sp = await searchParams;
  const ctx = await getPortalContext();

  if (!ctx.canWrite || !ctx.userId) {
    redirect(`/portal/projects/${projectId}`);
  }

  const batch = await prisma.gmaoImportBatch.findFirst({
    where: { id: batchId, projectId, createdById: ctx.userId },
    include: {
      rows: { orderBy: { rowIndex: "asc" }, take: 200 },
    },
  });

  if (!batch) {
    notFound();
  }

  const sheetNames = await listSheetNames(batch.storagePath);
  let headers: string[] = [];
  if (batch.sheetName) {
    try {
      const m = await readSheetMatrix(batch.storagePath, batch.sheetName, batch.headerRow);
      headers = m.headers;
    } catch {
      headers = [];
    }
  }

  const mappingSnapshot =
    batch.mappingSnapshotJson && typeof batch.mappingSnapshotJson === "object"
      ? (batch.mappingSnapshotJson as Record<string, string | null>)
      : null;

  const initialMapping =
    mappingSnapshot ??
    (headers.length > 0 ? suggestMapping(headers, batch.importType) : {});

  const targetFields = getTargetFieldsForImportType(batch.importType);

  const stats = batch.statsJson as Record<string, unknown> | null;

  const showMapping =
    Boolean(batch.sheetName) &&
    headers.length > 0 &&
    (batch.status === GmaoImportBatchStatus.MAPPING || batch.status === GmaoImportBatchStatus.VALIDATED);

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-kbio-teal">Import Excel</p>
          <h2 className="mt-1 text-xl font-semibold text-kbio-navy">{batch.fileName}</h2>
          <p className="text-sm text-slate-500">
            Lot {batch.id.slice(0, 8)}… · {batch.importType.replaceAll("_", " ")}
          </p>
        </div>
        <Link href={`/portal/projects/${projectId}/gmao/import`} className="text-sm font-medium text-kbio-teal hover:underline">
          Nouvel import
        </Link>
      </div>

      {sp.err === "sheet" ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Feuille invalide.
        </p>
      ) : null}
      {sp.err === "mapping-json" ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          Mapping JSON invalide.
        </p>
      ) : null}
      {sp.err === "required" && sp.fields ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          Champs obligatoires non mappes : {sp.fields}
        </p>
      ) : null}
      {sp.err === "state" ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          Etape incorrecte. Relancez la validation des lignes.
        </p>
      ) : null}
      {sp.ok === "template" ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          Modele de mapping enregistre.
        </p>
      ) : null}

      {/* Étape feuille */}
      {(batch.status === GmaoImportBatchStatus.UPLOADED ||
        (batch.status === GmaoImportBatchStatus.MAPPING && !batch.sheetName)) && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900">1. Choisir la feuille</h3>
          <form action={gmaoImportConfigureSheetAction} className="mt-4 max-w-md space-y-4">
            <input type="hidden" name="projectId" value={projectId} />
            <input type="hidden" name="batchId" value={batchId} />
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Feuille</label>
              <select name="sheetName" required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                {sheetNames.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Ligne d&apos;en-tete (1 = premiere ligne)</label>
              <input
                name="headerRow"
                type="number"
                min={1}
                defaultValue={batch.headerRow}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              className="rounded-full bg-kbio-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-kbio-navy/90"
            >
              Continuer
            </button>
          </form>
        </div>
      )}

      {/* Mapping */}
      {showMapping && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900">2. Mapper les colonnes</h3>
            <p className="mt-1 text-sm text-slate-600">
              Feuille <strong>{batch.sheetName}</strong>, ligne en-tete {batch.headerRow}.
            </p>
            {batch.importType === GmaoImportType.EQUIPMENT_INVENTORY ? (
              <div className="mt-4">
                <GmaoImportMappingForm
                  projectId={projectId}
                  batchId={batchId}
                  importType={batch.importType}
                  headers={headers}
                  targetFields={targetFields}
                  initialMapping={initialMapping}
                  initialMode={batch.mode}
                  initialDedupe={batch.dedupeStrategy ?? "code"}
                />
              </div>
            ) : (
              <p className="mt-4 text-sm text-amber-800">
                Le mapping visuel pour ce type d&apos;import arrive dans une prochaine version. Utilisez inventaire
                equipements pour tester le moteur.
              </p>
            )}
          </div>
        )}

      {/* Valider lignes */}
      {batch.status === GmaoImportBatchStatus.VALIDATED && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900">3. Valider les lignes</h3>
          <p className="mt-1 text-sm text-slate-600">
            Controle des types, champs obligatoires et doublons de code dans le fichier.
          </p>
          <form action={gmaoImportRunValidateAction} className="mt-4">
            <input type="hidden" name="projectId" value={projectId} />
            <input type="hidden" name="batchId" value={batchId} />
            <button
              type="submit"
              className="rounded-full bg-kbio-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-kbio-navy/90"
            >
              Lancer la validation
            </button>
          </form>
        </div>
      )}

      {/* Prévisualisation + commit */}
      {batch.status === GmaoImportBatchStatus.PREVIEWED && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900">4. Apercu et import</h3>
          {stats ? (
            <p className="mt-2 text-sm text-slate-700">
              Statuts :{" "}
              {Object.entries(stats)
                .map(([k, v]) => `${k}=${String(v)}`)
                .join(" · ")}
            </p>
          ) : null}
          {stats && Boolean((stats as { dryRun?: boolean }).dryRun) ? (
            <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-950">
              <strong>Simulation :</strong> aucune ecriture en base. Utilisez &quot;Importer en base&quot; pour
              appliquer.
            </p>
          ) : null}

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-xs">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-2 py-2">Ligne</th>
                  <th className="px-2 py-2">Statut</th>
                  <th className="px-2 py-2">Detail</th>
                </tr>
              </thead>
              <tbody>
                {batch.rows.map((r) => (
                  <tr key={r.id} className="border-t border-slate-100">
                    <td className="px-2 py-1.5">{r.rowIndex}</td>
                    <td className="px-2 py-1.5 font-medium">{r.status}</td>
                    <td className="px-2 py-1.5 text-slate-600">{r.errorMessage ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {batch.rows.length >= 200 ? (
              <p className="mt-2 text-xs text-slate-500">Affichage limite aux 200 premieres lignes.</p>
            ) : null}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <form action={gmaoImportCommitAction}>
              <input type="hidden" name="projectId" value={projectId} />
              <input type="hidden" name="batchId" value={batchId} />
              <input type="hidden" name="dryRun" value="1" />
              <button
                type="submit"
                className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                Simulation (sans ecriture)
              </button>
            </form>
            <form action={gmaoImportCommitAction}>
              <input type="hidden" name="projectId" value={projectId} />
              <input type="hidden" name="batchId" value={batchId} />
              <input type="hidden" name="dryRun" value="0" />
              <button
                type="submit"
                className="rounded-full bg-kbio-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-kbio-navy/90"
              >
                Importer en base
              </button>
            </form>
          </div>

          <details className="mt-6 rounded-lg border border-slate-200 bg-slate-50/80 p-4">
            <summary className="cursor-pointer text-sm font-medium text-slate-800">
              Enregistrer ce mapping comme modele
            </summary>
            <form action={gmaoImportSaveTemplateAction} className="mt-4 max-w-md space-y-3">
              <input type="hidden" name="projectId" value={projectId} />
              <input type="hidden" name="batchId" value={batchId} />
              <input
                name="name"
                required
                placeholder="Nom du modele"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                name="description"
                placeholder="Description (optionnel)"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <button
                type="submit"
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
              >
                Enregistrer
              </button>
            </form>
          </details>
        </div>
      )}

      {/* Après simulation ou import réel */}
      {(batch.status === GmaoImportBatchStatus.SUCCESS ||
        batch.status === GmaoImportBatchStatus.PARTIAL ||
        batch.status === GmaoImportBatchStatus.FAILED) && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900">Resultat</h3>
          <p className="mt-2 text-sm text-slate-700">
            Statut lot : <strong>{batch.status}</strong>
          </p>
          {stats ? (
            <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-50 p-3 text-xs text-slate-800">
              {JSON.stringify(stats, null, 2)}
            </pre>
          ) : null}
          <Link
            href={`/portal/projects/${projectId}/assets`}
            className="mt-4 inline-block text-sm font-medium text-kbio-teal hover:underline"
          >
            Voir les equipements du projet
          </Link>
        </div>
      )}

    </section>
  );
}
