import { RemarkTab } from "@prisma/client";
import { ProjectRemarks } from "@/components/portal/project-remarks";
import { PortalPrimaryLink } from "@/components/portal/portal-primary-link";
import { getPortalContext } from "@/lib/portal-scope";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ remarkErr?: string; remarkOk?: string }>;
};

export default async function ProjectWorkOrdersPage({ params, searchParams }: Props) {
  const { projectId } = await params;
  const sp = await searchParams;
  const ctx = await getPortalContext();

  let workOrders: Array<{
    id: string;
    reference: string;
    title: string;
    status: string;
    type: string;
    asset: { code: string; name: string };
    assignee: { name: string } | null;
  }> = [];

  try {
    workOrders = await prisma.workOrder.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      include: {
        asset: { select: { code: true, name: true } },
        assignee: { select: { name: true } },
      },
    });
  } catch {
    workOrders = [];
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Ordres de travail du projet</h2>
          <p className="mt-1 text-sm text-slate-600">
            Liste des ordres de travail rattaches a ce projet uniquement.
          </p>
          <a
            className="mt-2 inline-block text-sm font-medium text-kbio-teal hover:underline"
            href={`/api/exports/work-orders?projectId=${encodeURIComponent(projectId)}`}
          >
            Exporter Excel (.csv)
          </a>
        </div>
        {ctx.canWrite ? (
          <PortalPrimaryLink
            href={`/portal/work-orders/new?projectId=${encodeURIComponent(projectId)}`}
          >
            Nouvel ordre de travail
          </PortalPrimaryLink>
        ) : null}
      </div>
      <div className="grid gap-3">
        {workOrders.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
            Aucun ordre de travail pour ce projet.
          </p>
        ) : (
          workOrders.map((workOrder) => (
            <article key={workOrder.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-medium">
                    {workOrder.reference} - {workOrder.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {workOrder.asset.code} - {workOrder.asset.name}
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium">
                  {workOrder.status}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                Type: {workOrder.type} - Assigne a: {workOrder.assignee?.name ?? "N/A"}
              </p>
            </article>
          ))
        )}
      </div>
      {sp.remarkErr ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          Remarque invalide. Verifiez le contenu puis recommencez.
        </p>
      ) : null}
      {sp.remarkOk === "1" ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Remarque ajoutee.
        </p>
      ) : null}
      <ProjectRemarks
        projectId={projectId}
        tab={RemarkTab.WORK_ORDERS}
        returnTo={`/portal/projects/${projectId}/work-orders`}
      />
    </section>
  );
}
