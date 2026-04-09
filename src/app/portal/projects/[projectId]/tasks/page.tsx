import { RemarkTab } from "@prisma/client";
import { ProjectRemarks } from "@/components/portal/project-remarks";
import { ConfirmSubmitButton } from "@/components/portal/confirm-submit-button";
import { PortalPrimaryLink } from "@/components/portal/portal-primary-link";
import { deleteTaskFromForm } from "@/lib/portal-actions";
import { getPortalContext } from "@/lib/portal-scope";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ remarkErr?: string; remarkOk?: string }>;
};

export default async function ProjectTasksPage({ params, searchParams }: Props) {
  const { projectId } = await params;
  const sp = await searchParams;
  const ctx = await getPortalContext();

  let tasks: Array<{
    id: string;
    title: string;
    status: string;
    assignee: { name: string } | null;
  }> = [];

  try {
    tasks = await prisma.task.findMany({
      where: { projectId, archivedAt: null },
      orderBy: { createdAt: "desc" },
      include: { assignee: { select: { name: true } } },
    });
  } catch {
    tasks = [];
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Taches du projet</h2>
          <p className="mt-1 text-sm text-slate-600">Liste des taches rattachees a ce projet uniquement.</p>
          <a
            className="mt-2 inline-block text-sm font-medium text-kbio-teal hover:underline"
            href={`/api/exports/tasks?projectId=${encodeURIComponent(projectId)}`}
          >
            Exporter Excel (.csv)
          </a>
        </div>
        {ctx.canWrite ? (
          <PortalPrimaryLink href={`/portal/projects/${projectId}/tasks/new`}>
            Nouvelle tache
          </PortalPrimaryLink>
        ) : null}
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
              {ctx.canWrite ? (
                <form action={deleteTaskFromForm} className="mt-3">
                  <input type="hidden" name="taskId" value={task.id} />
                  <input type="hidden" name="projectId" value={projectId} />
                  <ConfirmSubmitButton className="text-sm font-medium text-red-700 hover:underline">
                    Supprimer
                  </ConfirmSubmitButton>
                </form>
              ) : null}
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
        tab={RemarkTab.TASKS}
        returnTo={`/portal/projects/${projectId}/tasks`}
      />
    </section>
  );
}
