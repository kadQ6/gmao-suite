import { RemarkTab } from "@prisma/client";
import { notFound } from "next/navigation";
import { ProjectAccessCodes } from "@/components/portal/project-access-codes";
import { ProjectRemarks } from "@/components/portal/project-remarks";
import { PortalPrimaryLink } from "@/components/portal/portal-primary-link";
import { getPortalContext } from "@/lib/portal-scope";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ created?: string; remarkErr?: string; remarkOk?: string }>;
};

export default async function ProjectOverviewPage({ params, searchParams }: Props) {
  const { projectId } = await params;
  const sp = await searchParams;
  const ctx = await getPortalContext();

  const project = await prisma.project
    .findUnique({
      where: { id: projectId },
      include: {
        owner: { select: { name: true } },
        tasks: { where: { archivedAt: null }, select: { status: true } },
      },
    })
    .catch(() => null);

  if (!project) {
    notFound();
  }

  const tasks = project.tasks;
  const stats = {
    tasks: tasks.length,
    todo: tasks.filter((t) => t.status === "TODO").length,
    inProgress: tasks.filter((t) => t.status === "IN_PROGRESS").length,
    done: tasks.filter((t) => t.status === "DONE").length,
    blocked: tasks.filter((t) => t.status === "BLOCKED").length,
  };

  const items = [
    { label: "Total taches", value: stats.tasks },
    { label: "A faire", value: stats.todo },
    { label: "En cours", value: stats.inProgress },
    { label: "Termine", value: stats.done },
    { label: "Bloque", value: stats.blocked },
  ];

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Pilotage</h2>
          <p className="mt-1 text-sm text-slate-600">
            Responsable projet :{" "}
            <span className="font-medium text-slate-800">{project.owner.name}</span>
          </p>
        </div>
        {ctx.canWrite ? (
          <PortalPrimaryLink href={`/portal/projects/${projectId}/tasks/new`}>
            Nouvelle tache
          </PortalPrimaryLink>
        ) : null}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {items.map((item) => (
          <article
            key={item.label}
            className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 text-center shadow-sm"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold text-kbio-navy">{item.value}</p>
          </article>
        ))}
      </div>
      {sp.created === "1" ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          Projet cree avec succes. Si un client est lie au projet, son code d&apos;acces est affiche ci-dessous.
        </p>
      ) : null}
      <ProjectAccessCodes projectId={projectId} canWrite={ctx.canWrite} />
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
      <ProjectRemarks projectId={projectId} tab={RemarkTab.OVERVIEW} returnTo={`/portal/projects/${projectId}`} />
    </section>
  );
}
