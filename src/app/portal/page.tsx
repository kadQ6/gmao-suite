import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PortalDashboardPage() {
  let projectCount = 0;
  let taskCount = 0;
  let openWorkOrders = 0;
  let assetCount = 0;
  let recentProjects: Array<{ id: string; code: string; name: string; _count: { tasks: number } }> = [];

  try {
    const [pc, tc, wo, ac, rp] = await Promise.all([
      prisma.project.count(),
      prisma.task.count(),
      prisma.workOrder.count({ where: { status: { in: ["OPEN", "IN_PROGRESS"] } } }),
      prisma.asset.count(),
      prisma.project.findMany({
        take: 5,
        orderBy: { updatedAt: "desc" },
        select: { id: true, code: true, name: true, _count: { select: { tasks: true } } },
      }),
    ]);
    projectCount = pc;
    taskCount = tc;
    openWorkOrders = wo;
    assetCount = ac;
    recentProjects = rp;
  } catch {
    // DB not ready
  }

  const kpis = [
    { label: "Projets actifs", value: projectCount },
    { label: "Taches (tous projets)", value: taskCount },
    { label: "OT ouverts", value: openWorkOrders },
    { label: "Equipements suivis", value: assetCount },
  ];

  return (
    <section className="space-y-10">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-slate-900">Tableau de bord</h2>
        <p className="text-sm text-slate-600">
          Vue globale : le detail du suivi se fait{" "}
          <strong className="font-medium text-slate-800">par projet</strong> (taches et pilotage).
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <article key={kpi.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{kpi.label}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{kpi.value}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">Projets recents</h3>
          <ul className="mt-4 space-y-3">
            {recentProjects.length === 0 ? (
              <li className="text-sm text-slate-500">Aucun projet pour le moment.</li>
            ) : (
              recentProjects.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-0">
                  <div>
                    <p className="font-medium text-slate-900">{p.name}</p>
                    <p className="text-xs text-slate-500">
                      {p.code} · {p._count.tasks} tache(s)
                    </p>
                  </div>
                  <Link
                    href={`/portal/projects/${p.id}`}
                    className="shrink-0 text-sm font-medium text-kbio-teal hover:underline"
                  >
                    Ouvrir
                  </Link>
                </li>
              ))
            )}
          </ul>
          <div className="mt-4">
            <Link href="/portal/projects" className="text-sm font-medium text-kbio-teal hover:underline">
              Voir tous les projets
            </Link>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">Maintenance (transversal)</h3>
          <p className="mt-2 text-sm text-slate-600">
            Equipements et ordres de travail sont geres au niveau du parc, independamment d&apos;un projet.
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link className="font-medium text-kbio-teal hover:underline" href="/portal/assets">
                Parc equipements
              </Link>
            </li>
            <li>
              <Link className="font-medium text-kbio-teal hover:underline" href="/portal/work-orders">
                Ordres de travail
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
