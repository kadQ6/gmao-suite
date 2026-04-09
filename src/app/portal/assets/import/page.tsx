import Link from "next/link";
import { importAssetsFromCsv } from "@/lib/portal-actions";

type Props = {
  searchParams: Promise<{ returnTo?: string; projectId?: string; err?: string; importReport?: string }>;
};

export default async function ImportAssetsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const returnTo = sp.returnTo || "/portal/assets";
  const projectId = sp.projectId || "";
  const report = new URLSearchParams(sp.importReport || "");

  const err =
    sp.err === "empty-file"
      ? "Veuillez choisir un fichier CSV non vide."
      : sp.err === "no-data"
        ? "Le fichier doit contenir un en-tete et au moins une ligne."
        : sp.err === "bad-header"
          ? "En-tete invalide. Colonnes obligatoires : code,name,category."
          : null;
  const created = Number.parseInt(report.get("created") || "0", 10);
  const updated = Number.parseInt(report.get("updated") || "0", 10);
  const ignored = Number.parseInt(report.get("ignored") || "0", 10);
  const invalidStatus = Number.parseInt(report.get("invalidStatus") || "0", 10);
  const hasReport = sp.importReport != null;

  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Importer des equipements (CSV)</h2>
        <p className="mt-2 text-sm text-slate-600">
          Colonnes minimales: <code>code,name,category</code>. Optionnelles:{" "}
          <code>location,status,projectCode</code>.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {hasReport ? (
          <p className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            Import termine - Crees: {created}, Mis a jour: {updated}, Ignores: {ignored}
            {invalidStatus > 0 ? ` (statuts invalides: ${invalidStatus})` : ""}.
          </p>
        ) : null}
        {err ? (
          <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{err}</p>
        ) : null}
        <a
          href="/api/exports/assets-template"
          className="mb-4 inline-block text-sm font-medium text-kbio-teal hover:underline"
        >
          Telecharger le modele CSV
        </a>
        <form action={importAssetsFromCsv} className="space-y-4">
          <input type="hidden" name="returnTo" value={returnTo} />
          <input type="hidden" name="projectId" value={projectId} />
          <div>
            <label htmlFor="file" className="mb-1 block text-sm font-medium text-slate-700">
              Fichier CSV
            </label>
            <input id="file" name="file" type="file" accept=".csv,text/csv" required className="block w-full text-sm" />
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" className="rounded-full bg-kbio-navy px-5 py-2 text-sm font-semibold text-white">
              Importer
            </button>
            <Link href={returnTo} className="text-sm font-medium text-slate-600 hover:underline">
              Retour
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
}
