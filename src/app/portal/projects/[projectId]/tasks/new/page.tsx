import Link from "next/link";
import { notFound } from "next/navigation";
import { createTaskFromForm } from "@/lib/portal-actions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const label = "block text-sm font-medium text-slate-700";
const input =
  "mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-[#0369a1] focus:outline-none focus:ring-1 focus:ring-[#0369a1]";

type Props = {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ err?: string }>;
};

export default async function NewTaskPage({ params, searchParams }: Props) {
  const { projectId } = await params;
  const sp = await searchParams;

  const project = await prisma.project
    .findUnique({
      where: { id: projectId },
      select: { id: true, code: true, name: true },
    })
    .catch(() => null);

  if (!project) {
    notFound();
  }

  let assignees: Array<{ id: string; name: string }> = [];
  try {
    assignees = await prisma.user.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });
  } catch {
    assignees = [];
  }

  const errMsg =
    sp.err === "required"
      ? "Le titre est obligatoire."
      : sp.err === "assignee"
        ? "Assigne invalide."
        : null;

  return (
    <section className="mx-auto max-w-lg space-y-6">
      <nav className="text-sm text-slate-500">
        <Link href="/portal" className="hover:text-[#0369a1]">
          Portail
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/portal/projects/${projectId}`} className="hover:text-[#0369a1]">
          {project.code}
        </Link>
        <span className="mx-2">/</span>
        <span className="font-medium text-slate-800">Nouvelle tache</span>
      </nav>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Nouvelle tache</h1>
        <p className="mt-1 text-sm text-slate-600">Projet : {project.name}</p>

        {errMsg ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{errMsg}</p>
        ) : null}

        <form action={createTaskFromForm} className="mt-6 space-y-4">
          <input type="hidden" name="projectId" value={projectId} />
          <div>
            <label htmlFor="title" className={label}>
              Titre
            </label>
            <input id="title" name="title" className={input} required maxLength={500} />
          </div>
          <div>
            <label htmlFor="description" className={label}>
              Detail (optionnel)
            </label>
            <textarea id="description" name="description" className={input} rows={3} maxLength={4000} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="priority" className={label}>
                Priorite (1 = max)
              </label>
              <select id="priority" name="priority" className={input} defaultValue="2">
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
            </div>
            <div>
              <label htmlFor="assigneeId" className={label}>
                Assigne (optionnel)
              </label>
              <select id="assigneeId" name="assigneeId" className={input} defaultValue="">
                <option value="">Non assigne</option>
                {assignees.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              style={{
                display: "inline-flex",
                padding: "10px 20px",
                borderRadius: 9999,
                backgroundColor: "#0369a1",
                color: "#fff",
                fontWeight: 600,
                fontSize: 14,
                border: "none",
                cursor: "pointer",
              }}
            >
              Ajouter la tache
            </button>
            <Link
              href={`/portal/projects/${projectId}/tasks`}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Annuler
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
}
