import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function WorkOrdersPage() {
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
      <h2 className="text-xl font-semibold">Ordres de travail</h2>
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
