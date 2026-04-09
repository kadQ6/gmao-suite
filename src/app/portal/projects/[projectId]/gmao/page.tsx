import Link from "next/link";
import { getPortalContext } from "@/lib/portal-scope";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ projectId: string }> };

const modules = [
  {
    title: "Inventaire & equipements",
    desc: "Parc biomédical, fiches détaillées, statuts et rattachement site / service.",
    hrefSuffix: "/assets",
    status: "actif",
  },
  {
    title: "Ordres de travail",
    desc: "Suivi correctif / préventif lié aux actifs du projet.",
    hrefSuffix: "/work-orders",
    status: "actif",
  },
  {
    title: "Plans de maintenance",
    desc: "Fréquences, échéances, checklists — evolution du modele MaintenancePlan.",
    hrefSuffix: null,
    status: "a venir",
  },
  {
    title: "Interventions",
    desc: "Workflow complet, pièces, coûts, pièces jointes — evolution du modele Intervention.",
    hrefSuffix: null,
    status: "a venir",
  },
  {
    title: "Stock & kits",
    desc: "Catalogue pièces, emplacements, mouvements, kits MP.",
    hrefSuffix: null,
    status: "a venir",
  },
  {
    title: "Achats",
    desc: "Commandes, réceptions, lien inventaire et immobilisation.",
    hrefSuffix: null,
    status: "a venir",
  },
  {
    title: "Immobilisation",
    desc: "Valorisation, amortissement, règles par catégorie.",
    hrefSuffix: null,
    status: "a venir",
  },
  {
    title: "Import Excel",
    desc: "Mapping colonnes, validation, deduplication, rapports.",
    hrefSuffix: "/gmao/import",
    status: "actif",
  },
  {
    title: "Tableau de bord GMAO",
    desc: "KPIs parc, MP, stock, interventions — filtres multi-criteres.",
    hrefSuffix: null,
    status: "a venir",
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
          Hub dedie a la logique GMAO (inventaire, maintenance, stock, achats, immobilisation). Les modules
          marques &quot;a venir&quot; seront developpes selon le plan decrit dans{" "}
          <code className="rounded bg-slate-100 px-1 text-xs">docs/GMAO_BIOMED_ARCHITECTURE.md</code>.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((m) => {
          const href = m.hrefSuffix ? `${base}${m.hrefSuffix}` : null;
          const active = m.status === "actif";
          const inner = (
            <>
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-slate-900">{m.title}</h3>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                    active ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {active ? "Disponible" : "A venir"}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600">{m.desc}</p>
              {href ? (
                <p className="mt-3 text-sm font-medium text-kbio-teal">Ouvrir →</p>
              ) : (
                <p className="mt-3 text-sm text-slate-400">Bientot dans une prochaine livraison</p>
              )}
            </>
          );
          return href ? (
            <Link
              key={m.title}
              href={href}
              className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-kbio-teal/40 hover:shadow-md"
            >
              {inner}
            </Link>
          ) : (
            <div
              key={m.title}
              className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-4"
            >
              {inner}
            </div>
          );
        })}
      </div>

      {ctx.canWrite ? (
        <p className="text-xs text-slate-500">
          Prochaine etape produit : fournir le template Excel de reference pour caler les imports et les champs
          inventaire sur votre vocabulaire metier.
        </p>
      ) : null}
    </section>
  );
}
