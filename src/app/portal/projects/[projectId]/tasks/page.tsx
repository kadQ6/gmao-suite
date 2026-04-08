import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ projectId: string }> };

export default async function ProjectTasksPage({ params }: Props) {
  const { projectId } = await params;

  let tasks: Array<{
    id: string;
    title: string;
    status: string;
    assignee: { name: string } | null;
  }> = [];

  try {
    tasks = await prisma.task.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      include: { assignee: { select: { name: true } } },
    });
  } catch {
    tasks = [];
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Taches du projet</h2>
        <p className="mt-1 text-sm text-slate-600">Liste des taches rattachees a ce projet uniquement.</p>
      </div>
      <div className="grid gap-3">
        {tasks.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
            Aucune tache pour ce projet.
          </p>
        ) : (
          tasks.map((task) => (
            <article key={task.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-medium text-slate-900">{task.title}</h3>
                </div>
                <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                  {task.status}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                Assigne a : {task.assignee?.name ?? "Non assigne"}
              </p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
