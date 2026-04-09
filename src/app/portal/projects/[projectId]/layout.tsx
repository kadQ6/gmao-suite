import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectSubNav } from "@/components/portal/project-sub-nav";
import { canReadProject } from "@/lib/access";
import { getPortalContext } from "@/lib/portal-scope";
import { prisma } from "@/lib/prisma";

type Props = {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
};

export default async function ProjectPortalLayout({ children, params }: Props) {
  const { projectId } = await params;
  const ctx = await getPortalContext();

  let project: { id: string; code: string; name: string; description: string | null } | null = null;
  try {
    project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, code: true, name: true, description: true },
    });
  } catch {
    project = null;
  }

  if (!project) {
    notFound();
  }

  const allowed = await canReadProject(ctx.userId, ctx.role, projectId);
  if (!allowed) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <nav className="text-sm text-slate-500">
        <Link href="/portal" className="hover:text-kbio-navy">
          Portail
        </Link>
        <span className="mx-2">/</span>
        <Link href="/portal/projects" className="hover:text-kbio-navy">
          Projets
        </Link>
        <span className="mx-2">/</span>
        <span className="font-medium text-slate-800">{project.code}</span>
      </nav>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-kbio-teal">Projet</p>
            <h1 className="text-2xl font-semibold text-kbio-navy">{project.name}</h1>
            <p className="mt-1 text-sm text-slate-500">{project.code}</p>
          </div>
          <Link href="/portal/projects" className="text-sm font-medium text-kbio-teal hover:underline">
            Tous les projets
          </Link>
        </div>
        {project.description ? (
          <p className="mt-4 text-sm leading-relaxed text-slate-600">{project.description}</p>
        ) : null}
      </div>

      <ProjectSubNav projectId={project.id} />

      <div>{children}</div>
    </div>
  );
}
