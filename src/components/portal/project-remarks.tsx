import { RemarkTab } from "@prisma/client";
import { createProjectRemarkFromForm } from "@/lib/portal-actions";
import { prisma } from "@/lib/prisma";

type Props = {
  projectId: string;
  tab: RemarkTab;
  returnTo: string;
};

export async function ProjectRemarks({ projectId, tab, returnTo }: Props) {
  const remarks = await prisma.projectRemark.findMany({
    where: { projectId, tab },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { createdBy: { select: { name: true, role: true } } },
  });

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Remarques ({remarks.length})</h3>
      <p className="mt-1 text-xs text-slate-500">
        Espace d&apos;echange client: vous pouvez ajouter des remarques, sans modifier les donnees operationnelles.
      </p>
      <form action={createProjectRemarkFromForm} className="mt-3 space-y-2">
        <input type="hidden" name="projectId" value={projectId} />
        <input type="hidden" name="tab" value={tab} />
        <input type="hidden" name="returnTo" value={returnTo} />
        <textarea
          name="body"
          required
          maxLength={2000}
          rows={3}
          placeholder="Saisissez votre remarque..."
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900"
        />
        <button
          type="submit"
          className="inline-flex items-center rounded-full bg-kbio-navy px-4 py-2 text-xs font-semibold text-white hover:bg-kbio-navy/90"
        >
          Ajouter une remarque
        </button>
      </form>
      <div className="mt-4 space-y-2">
        {remarks.length === 0 ? (
          <p className="text-xs text-slate-500">Aucune remarque pour cet onglet.</p>
        ) : (
          remarks.map((remark) => (
            <article key={remark.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
              <p className="text-sm text-slate-800">{remark.body}</p>
              <p className="mt-1 text-xs text-slate-500">
                {remark.createdBy.name} ({remark.createdBy.role}) - {remark.createdAt.toLocaleString("fr-FR")}
              </p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
