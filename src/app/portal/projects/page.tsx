import Link from "next/link";
import { ConfirmSubmitButton } from "@/components/portal/confirm-submit-button";
import { PortalPrimaryLink } from "@/components/portal/portal-primary-link";
import { deleteProjectFromForm } from "@/lib/portal-actions";
import { getPortalContext, getProjectScopeWhere } from "@/lib/portal-scope";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const ctx = await getPortalContext();
  const where = getProjectScopeWhere(ctx);

  let projects: Array<{
    id: string;
    code: string;
    name: string;
    owner: { name: string };
    _count: { tasks: number };
  }> = [];
  try {
    projects = await prisma.project.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        owner: { select: { name: true } },
        _count: { select: { tasks: true } },
      },
    });
  } catch {
    projects = [];
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Projets</h2>
          <p className="mt-1 text-sm text-slate-600">
            Selectionnez un projet pour acceder au suivi des taches et au pilotage.
          </p>
          <a className="mt-2 inline-block text-sm font-medium text-kbio-teal hover:underline" href="/api/exports/projects">
            Exporter Excel (.csv)
          </a>
        </div>
        {ctx.canWrite ? <PortalPrimaryLink href="/portal/projects/new">Nouveau projet</PortalPrimaryLink> : null}
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Responsable</th>
              <th className="px-4 py-3">Taches</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium">{project.code}</td>
                <td className="px-4 py-3">{project.name}</td>
                <td className="px-4 py-3">{project.owner.name}</td>
                <td className="px-4 py-3">{project._count.tasks}</td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex items-center gap-3">
                    <Link
                      href={`/portal/projects/${project.id}`}
                      className="font-medium text-kbio-teal hover:underline"
                    >
                      Ouvrir
                    </Link>
                    {ctx.canWrite ? (
                      <form action={deleteProjectFromForm}>
                        <input type="hidden" name="projectId" value={project.id} />
                        <ConfirmSubmitButton
                          className="text-sm font-medium text-amber-700 hover:underline"
                          title="Effacer ce projet"
                          message="Etes-vous sur ?"
                        >
                          Effacer
                        </ConfirmSubmitButton>
                      </form>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
