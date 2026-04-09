import { GmaoImportType } from "@prisma/client";
import Link from "next/link";
import { redirect } from "next/navigation";
import { gmaoImportStartAction } from "@/lib/gmao-import-actions";
import { getPortalContext } from "@/lib/portal-scope";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ err?: string }>;
};

const ERR_MSG: Record<string, string> = {
  file: "Choisissez un fichier Excel non vide.",
  size: "Fichier trop volumineux (max. 12 Mo).",
  ext: "Extension acceptee : .xlsx ou .xlsm.",
  type: "Type d'import invalide.",
  "type-not-ready": "Seul l'import inventaire equipements est disponible pour le moment.",
};

export default async function GmaoImportStartPage({ params, searchParams }: Props) {
  const { projectId } = await params;
  const sp = await searchParams;
  const ctx = await getPortalContext();

  if (!ctx.canWrite || !ctx.userId) {
    redirect(`/portal/projects/${projectId}`);
  }

  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-kbio-teal">Import Excel</p>
        <h2 className="mt-1 text-xl font-semibold text-kbio-navy">Nouvel import</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Deposez un classeur Excel. Le moteur detecte les feuilles et les colonnes ; vous mappez les champs puis
          validez avant ecriture en base. Seul l&apos;import inventaire equipements est actif pour l&apos;instant.
        </p>
      </div>

      {sp.err ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {ERR_MSG[sp.err] ?? "Une erreur est survenue."}
        </p>
      ) : null}

      <form action={gmaoImportStartAction} encType="multipart/form-data" className="max-w-lg space-y-4">
        <input type="hidden" name="projectId" value={projectId} />
        <input type="hidden" name="importType" value={GmaoImportType.EQUIPMENT_INVENTORY} />
        <p className="text-sm text-slate-600">
          Type : <strong>Inventaire equipements</strong> (autres types GMAO : prochainement).
        </p>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Fichier (.xlsx, .xlsm)</label>
          <input
            name="file"
            type="file"
            accept=".xlsx,.xlsm,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            required
            className="w-full text-sm text-slate-600"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-full bg-kbio-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-kbio-navy/90"
          >
            Continuer
          </button>
          <Link
            href={`/portal/projects/${projectId}/gmao`}
            className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Annuler
          </Link>
        </div>
      </form>
    </section>
  );
}
