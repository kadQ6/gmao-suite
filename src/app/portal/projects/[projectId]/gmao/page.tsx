import Link from "next/link";
import { getPortalContext } from "@/lib/portal-scope";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ projectId: string }> };

const modules = [
  {
    title: "Inventaire & equipements",
    desc: "Parc biomédical, fiches détaillées, statuts et rattachement site / service.",
    hrefSuffix: "/gmao/inventory",
    badge: "Disponible" as const,
  },
  {
    title: "Ordres de travail",
    desc: "Suivi correctif / préventif lié aux actifs du projet.",
    hrefSuffix: "/work-orders",
    badge: "Disponible" as const,
  },
  {
    title: "Plans de maintenance",
    desc: "Fréquences, échéances, checklists — évolution du modèle MaintenancePlan.",
    hrefSuffix: "/gmao/maintenance-plans",
    badge: "Aperçu" as const,
  },
  {
    title: "Interventions",
    desc: "Workflow complet, pièces, coûts, pièces jointes.",
    hrefSuffix: "/gmao/interventions",
    badge: "Aperçu" as const,
  },
  {
    title: "Stock & kits",
    desc: "Catalogue pièces, emplacements, mouvements, kits MP.",
    hrefSuffix: "/gmao/stock",
    badge: "Aperçu" as const,
  },
  {
    title: "Achats",
    desc: "Commandes, réceptions, lien inventaire et immobilisation.",
    hrefSuffix: "/gmao/purchases",
    badge: "Aperçu" as const,
  },
  {
    title: "Immobilisation",
    desc: "Valorisation, amortissement, règles par catégorie.",
    hrefSuffix: "/gmao/fixed-assets",
    badge: "Aperçu" as const,
  },
  {
    title: "Import Excel",
    desc: "Mapping colonnes, validation, déduplication, rapports.",
    hrefSuffix: "/gmao/import",
    badge: "Disponible" as const,
  },
  {
    title: "Tableau de bord GMAO",
    desc: "KPIs parc, MP, stock, interventions — filtres multi-critères.",
    hrefSuffix: "/gmao/dashboard",
    badge: "Aperçu" as const,
  },
] as const;

export default async function ProjectGmaoHubPage({ params }: Props) {
  const { projectId } = await params;
  const ctx = await getPortalContext();
  const base = `/portal/projects/${projectId}`;

  return (
    <section className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-kbio-teal">GMAO biomedicale</p>
        <h2 className="mt-1 text-xl font-semibold text-kbio-navy">Pilotage technique du projet</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
          Toutes les entrées sont cliquables. <strong>Disponible</strong> : fonctions branchées (inventaire, OT, import
          Excel). <strong>Aperçu</strong> : page d&apos;orientation ; le détail métier arrive selon{" "}
          <code className="rounded bg-slate-100 px-1 text-xs">docs/GMAO_BIOMED_ARCHITECTURE.md</code>.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((m) => {
          const href = `${base}${m.hrefSuffix}`;
          const isFull = m.badge === "Disponible";
          const inner = (
            <>
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-slate-900">{m.title}</h3>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                    isFull ? "bg-emerald-100 text-emerald-800" : "bg-sky-100 text-sky-900"
                  }`}
                >
                  {m.badge}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600">{m.desc}</p>
              <p className="mt-3 text-sm font-medium text-kbio-teal">Ouvrir →</p>
            </>
          );
          return (
            <Link
              key={m.title}
              href={href}
              className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-kbio-teal/40 hover:shadow-md"
            >
              {inner}
            </Link>
          );
        })}
      </div>

      {ctx.canWrite ? (
        <p className="text-xs text-slate-500">
          Import Excel : les colonnes code et libellé suffisent ; sans catégorie, les lignes sont classées en « Non classé
          ».
        </p>
      ) : null}
    </section>
  );
}
