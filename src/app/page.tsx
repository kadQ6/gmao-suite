import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
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
        <h2 className="text-2xl font-semibold">Dashboard</h2>
        <p className="text-sm text-slate-600">
          Base prete pour le suivi de projet et la maintenance (GMAO).
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <article key={kpi.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{kpi.label}</p>
            <p className="mt-2 text-3xl font-semibold">{kpi.value}</p>
          </article>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-semibold">Prochaine etape</h3>
        <p className="mt-2 text-sm text-slate-600">
          Branche l&apos;authentification (Auth.js) et ajoute les formulaires CRUD pour finaliser ton MVP.
        </p>
      </div>
    </section>
  );
}
