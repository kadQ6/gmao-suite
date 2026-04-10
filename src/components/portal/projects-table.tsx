import Link from "next/link";
import { ConfirmSubmitButton } from "@/components/portal/confirm-submit-button";
import { deleteProjectFromForm } from "@/lib/portal-actions";

type Row = {
  id: string;
  code: string;
  name: string;
  owner: { name: string };
  _count: { tasks: number };
};

export function ProjectsTable({ projects, canWrite }: { projects: Row[]; canWrite: boolean }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-900/60 shadow-sm">
      <table className="w-full text-left text-sm text-slate-200">
        <thead className="bg-slate-800/90 text-slate-400">
          <tr>
            <th className="px-4 py-3">Code</th>
            <th className="px-4 py-3">Nom</th>
            <th className="px-4 py-3">Responsable</th>
            <th className="px-4 py-3">Tâches</th>
            <th className="px-4 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr key={project.id} className="border-t border-slate-700/80">
              <td className="px-4 py-3 font-medium text-white">{project.code}</td>
              <td className="px-4 py-3">{project.name}</td>
              <td className="px-4 py-3">{project.owner.name}</td>
              <td className="px-4 py-3">{project._count.tasks}</td>
              <td className="px-4 py-3 text-right">
                <div className="inline-flex items-center gap-3">
                  <Link href={`/portal/projects/${project.id}`} className="font-medium text-sky-400 hover:underline">
                    Ouvrir
                  </Link>
                  {canWrite ? (
                    <form action={deleteProjectFromForm}>
                      <input type="hidden" name="projectId" value={project.id} />
                      <ConfirmSubmitButton
                        className="text-sm font-medium text-amber-400 hover:underline"
                        title="Effacer ce projet"
                        message="Êtes-vous sûr ?"
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
  );
}
