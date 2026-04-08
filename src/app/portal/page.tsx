import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PortalDashboardPage() {
  let projects = 0;
  let tasks = 0;
  let openWorkOrders = 0;
  let assets = 0;

  try {
    [projects, tasks, openWorkOrders, assets] = await Promise.all([
      prisma.project.count(),
      prisma.task.count(),
      prisma.workOrder.count({ where: { status: { in: ["OPEN", "IN_PROGRESS"] } } }),
      prisma.asset.count(),
    ]);
  } catch {
    // Keep the dashboard accessible even before DB setup.
  }

  const kpis = [
    { label: "Projets", value: projects },
    { label: "Taches", value: tasks },
    { label: "OT ouverts", value: openWorkOrders },
    { label: "Equipements", value: assets },
  ];

  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-slate-900">Tableau de bord</h2>
        <p className="text-sm text-slate-600">
          Vue synthetique du suivi projet et de la maintenance (portail K&apos;BIO).
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

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">Raccourcis</h3>
        <ul className="mt-3 flex flex-wrap gap-3 text-sm">
          <li>
            <Link className="text-kbio-teal hover:underline" href="/portal/projects">
              Projets
            </Link>
          </li>
          <li>
            <Link className="text-kbio-teal hover:underline" href="/portal/tasks">
              Taches
            </Link>
          </li>
          <li>
            <Link className="text-kbio-teal hover:underline" href="/portal/assets">
              Equipements
            </Link>
          </li>
          <li>
            <Link className="text-kbio-teal hover:underline" href="/portal/work-orders">
              Ordres de travail
            </Link>
          </li>
        </ul>
      </div>
    </section>
  );
}
