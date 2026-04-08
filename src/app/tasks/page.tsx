import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  let tasks: Array<{
    id: string;
    title: string;
    status: string;
    project: { code: string; name: string };
    assignee: { name: string } | null;
  }> = [];
  try {
    tasks = await prisma.task.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        project: { select: { code: true, name: true } },
        assignee: { select: { name: true } },
      },
    });
  } catch {
    tasks = [];
  }

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Taches</h2>
      <div className="grid gap-3">
        {tasks.map((task) => (
          <article key={task.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-medium">{task.title}</h3>
                <p className="mt-1 text-xs text-slate-500">
                  {task.project.code} - {task.project.name}
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium">
                {task.status}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-600">Assigne a: {task.assignee?.name ?? "N/A"}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
