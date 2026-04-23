import Link from "next/link";
import { PortalPrimaryLink } from "@/components/portal/portal-primary-link";
import { getAssetScopeWhere, getPortalContext, getProjectScopeWhere, getWorkOrderScopeWhere } from "@/lib/portal-scope";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PortalDashboardPage() {
  const ctx = await getPortalContext();
  const projectWhere = getProjectScopeWhere(ctx);
  const assetWhere = getAssetScopeWhere(ctx);
  const workOrderWhere = getWorkOrderScopeWhere(ctx);

  let projectCount = 0;
  let taskCount = 0;
  let openWorkOrders = 0;
  let assetCount = 0;
  let recentProjects: Array<{ id: string; code: string; name: string; _count: { tasks: number } }> = [];

  try {
    const [pc, tc, wo, ac, rp] = await Promise.all([
      prisma.project.count({ where: projectWhere }),
      prisma.task.count({ where: { archivedAt: null, project: projectWhere } }),
      prisma.workOrder.count({ where: { ...workOrderWhere, status: { in: ["OPEN", "IN_PROGRESS"] } } }),
      prisma.asset.count({ where: assetWhere }),
      prisma.project.findMany({
        where: projectWhere,
        take: 6,
        orderBy: { updatedAt: "desc" },
        select: { id: true, code: true, name: true, _count: { select: { tasks: true } } },
      }),
    ]);
    projectCount = pc; taskCount = tc; openWorkOrders = wo; assetCount = ac; recentProjects = rp;
  } catch { /* DB not ready */ }

  const kpis = [
    {
      label: "Projets actifs",
      value: projectCount,
      href: "/portal/projects",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
          <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      ),
      color: "bg-kbio-teal/10 text-kbio-teal",
    },
    {
      label: "Tâches en cours",
      value: taskCount,
      href: "/portal/tasks",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
          <path d="M9 11l3 3L22 4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      color: "bg-indigo-100 text-indigo-600",
    },
    {
      label: "OT ouverts",
      value: openWorkOrders,
      href: "/portal/work-orders",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
          <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      color: "bg-amber-100 text-amber-600",
    },
    {
      label: "Équipements suivis",
      value: assetCount,
      href: "/portal/assets",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      color: "bg-emerald-100 text-emerald-600",
    },
  ];

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>
          <p className="mt-1 text-sm text-slate-500">
            Bienvenue sur votre espace de gestion K&apos;BIO.
          </p>
        </div>
        {ctx.canWrite ? (
          <div className="flex flex-wrap gap-2">
            <PortalPrimaryLink href="/portal/projects/new">+ Nouveau projet</PortalPrimaryLink>
            <PortalPrimaryLink href="/portal/assets/new">+ Équipement</PortalPrimaryLink>
          </div>
        ) : null}
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <Link
            key={kpi.label}
            href={kpi.href}
            className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-kbio-teal/40 hover:shadow-md"
          >
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${kpi.color}`}>
              {kpi.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{kpi.value}</p>
              <p className="text-xs font-medium text-slate-500">{kpi.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Actions rapides */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-900">Accès rapide</h2>
        <p className="mt-1 text-sm text-slate-500">
          {ctx.canWrite
            ? "Créer un projet, enregistrer un équipement ou accéder aux modules métier."
            : "Consultez vos projets et vos indicateurs de suivi."}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/portal/client" className="inline-flex items-center gap-2 rounded-full bg-kbio-navy px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#002f5c]">
            Espace client
          </Link>
          <Link href="/portal/projects" className="inline-flex items-center rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-kbio-teal hover:text-kbio-teal">
            Projets
          </Link>
          <Link href="/portal/assets" className="inline-flex items-center rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-kbio-teal hover:text-kbio-teal">
            Parc équipements
          </Link>
          <Link href="/portal/work-orders" className="inline-flex items-center rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-kbio-teal hover:text-kbio-teal">
            Ordres de travail
          </Link>
          <Link href="/portal/gmao-biomed" className="inline-flex items-center rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-kbio-teal hover:text-kbio-teal">
            GMAO biomédicale
          </Link>
        </div>
      </div>

      {/* Projets récents + Maintenance */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Projets récents */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Projets récents</h2>
            <Link href="/portal/projects" className="text-xs font-semibold text-kbio-teal hover:underline">
              Voir tout →
            </Link>
          </div>
          <ul className="mt-5 space-y-3">
            {recentProjects.length === 0 ? (
              <li className="rounded-xl border border-dashed border-slate-200 py-8 text-center text-sm text-slate-400">
                Aucun projet pour le moment.
              </li>
            ) : (
              recentProjects.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/portal/projects/${p.id}`}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3 transition hover:border-kbio-teal/30 hover:bg-white hover:shadow-sm"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{p.name}</p>
                      <p className="mt-0.5 text-xs text-slate-400">{p.code} · {p._count.tasks} tâche{p._count.tasks !== 1 ? "s" : ""}</p>
                    </div>
                    <svg viewBox="0 0 20 20" fill="currentColor" className="ml-3 h-4 w-4 shrink-0 text-kbio-teal">
                      <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Modules métier */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900">Modules métier</h2>
          <p className="mt-1 text-sm text-slate-500">
            Outils transversaux accessibles indépendamment des projets.
          </p>
          <div className="mt-5 space-y-2">
            {[
              { href: "/portal/assets", label: "Parc équipements", desc: "Inventaire et suivi des dispositifs médicaux" },
              { href: "/portal/work-orders", label: "Ordres de travail", desc: "Maintenance préventive et corrective" },
              { href: "/portal/gmao-biomed", label: "GMAO biomédicale", desc: "Module intégré de gestion biomédicale" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3 transition hover:border-kbio-teal/30 hover:bg-white hover:shadow-sm"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{item.desc}</p>
                </div>
                <svg viewBox="0 0 20 20" fill="currentColor" className="ml-3 h-4 w-4 shrink-0 text-kbio-teal">
                  <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
