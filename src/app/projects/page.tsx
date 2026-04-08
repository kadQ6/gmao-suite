import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  let projects: Array<{
    id: string;
    code: string;
    name: string;
    owner: { name: string };
    _count: { tasks: number };
  }> = [];
  try {
    projects = await prisma.project.findMany({
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
      <h2 className="text-xl font-semibold">Projets</h2>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Taches</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium">{project.code}</td>
                <td className="px-4 py-3">{project.name}</td>
                <td className="px-4 py-3">{project.owner.name}</td>
                <td className="px-4 py-3">{project._count.tasks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
