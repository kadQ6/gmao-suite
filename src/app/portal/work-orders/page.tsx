import Link from "next/link";
import { PortalPrimaryLink } from "@/components/portal/portal-primary-link";
import { getPortalContext, getWorkOrderScopeWhere } from "@/lib/portal-scope";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function WorkOrdersPage() {
  const ctx = await getPortalContext();
  const where = getWorkOrderScopeWhere(ctx);

  let workOrders: Array<{
    id: string;
    reference: string;
    title: string;
    status: string;
    type: string;
    asset: { code: string; name: string };
    project: { id: string; code: string; name: string } | null;
    assignee: { name: string } | null;
  }> = [];
  try {
    workOrders = await prisma.workOrder.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        asset: { select: { code: true, name: true } },
        project: { select: { id: true, code: true, name: true } },
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
          <h2 className="text-xl font-semibold">Ordres de travail</h2>
          <Link className="mt-2 inline-block text-sm font-medium text-kbio-teal hover:underline" href="/api/exports/work-orders">
            Exporter Excel (.csv)
          </Link>
        </div>
        {ctx.canWrite ? <PortalPrimaryLink href="/portal/work-orders/new">Nouvel ordre de travail</PortalPrimaryLink> : null}
      </div>
      <div className="grid gap-3">
        {workOrders.map((workOrder) => (
          <article key={workOrder.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-medium">
                  {workOrder.reference} - {workOrder.title}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  {workOrder.asset.code} - {workOrder.asset.name}
                  {workOrder.project ? (
                    <>
                      {" "}
                      · Projet{" "}
                      <Link
                        href={`/portal/projects/${workOrder.project.id}`}
                        className="text-kbio-teal hover:underline"
                      >
                        {workOrder.project.code}
                      </Link>
                    </>
                  ) : (
                    " · Projet —"
                  )}
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
        ))}
      </div>
    </section>
  );
}
