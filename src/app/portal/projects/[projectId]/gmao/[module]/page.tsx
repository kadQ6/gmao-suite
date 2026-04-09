import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { canReadProject } from "@/lib/access";
import { getPortalContext } from "@/lib/portal-scope";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ projectId: string; module: string }>;
};

const MODULES: Record<string, { title: string; body: string }> = {
  "maintenance-plans": {
    title: "Plans de maintenance",
    body:
      "Fréquences, échéances et checklists seront pilotées ici (modèle MaintenancePlan). Les données liées aux équipements et OT restent accessibles depuis les onglets du projet.",
  },
  interventions: {
    title: "Interventions",
    body:
      "Workflow interventions, pièces et coûts : module en conception. En attendant, utilisez les ordres de travail du projet.",
  },
  stock: {
    title: "Stock & kits",
    body:
      "Catalogue pièces, emplacements et mouvements : module en conception. L’inventaire équipements et l’import Excel restent disponibles.",
  },
  purchases: {
    title: "Achats",
    body: "Commandes et réceptions liées au parc : module en conception.",
  },
  "fixed-assets": {
    title: "Immobilisation",
    body: "Valorisation et amortissement par catégorie : module en conception.",
  },
  dashboard: {
    title: "Tableau de bord GMAO",
    body: "Indicateurs consolidés (parc, maintenance, stock) : module en conception. Les vues projet et listes restent opérationnelles.",
  },
};

export default async function GmaoModulePage({ params }: Props) {
  const { projectId, module } = await params;

  if (module === "inventory") {
    redirect(`/portal/projects/${projectId}/assets`);
  }

  const ctx = await getPortalContext();
  const allowed = await canReadProject(ctx.userId, ctx.role, projectId);
  if (!allowed) notFound();

  let projectCode = projectId;
  try {
    const p = await prisma.project.findUnique({
      where: { id: projectId, archivedAt: null },
      select: { code: true },
    });
    if (p) projectCode = p.code;
  } catch {
    /* ignore */
  }

  const block = MODULES[module];
  if (!block) notFound();

  const base = `/portal/projects/${projectId}/gmao`;

  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <nav className="text-sm text-slate-500">
        <Link href="/portal" className="hover:text-kbio-navy">
          Portail
        </Link>
        <span className="mx-2">/</span>
        <Link href="/portal/projects" className="hover:text-kbio-navy">
          Projets
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/portal/projects/${projectId}`} className="hover:text-kbio-navy">
          {projectCode}
        </Link>
        <span className="mx-2">/</span>
        <Link href={base} className="hover:text-kbio-navy">
          GMAO
        </Link>
        <span className="mx-2">/</span>
        <span className="font-medium text-slate-800">{block.title}</span>
      </nav>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-kbio-navy">{block.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">{block.body}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={base}
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Retour hub GMAO
          </Link>
          <Link
            href={`/portal/projects/${projectId}/work-orders`}
            className="rounded-full bg-kbio-navy px-4 py-2 text-sm font-semibold text-white hover:bg-kbio-navy/90"
          >
            Ordres de travail
          </Link>
        </div>
      </div>
    </section>
  );
}
