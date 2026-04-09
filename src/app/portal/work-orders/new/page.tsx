import Link from "next/link";
import { createWorkOrderFromForm } from "@/lib/portal-actions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const label = "block text-sm font-medium text-slate-700";
const input =
  "mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-[#0369a1] focus:outline-none focus:ring-1 focus:ring-[#0369a1]";

type Props = { searchParams: Promise<{ err?: string; projectId?: string }> };

export default async function NewWorkOrderPage({ searchParams }: Props) {
  const sp = await searchParams;

  let assets: Array<{ id: string; code: string; name: string }> = [];
  let assignees: Array<{ id: string; name: string }> = [];
  let projects: Array<{ id: string; code: string; name: string }> = [];
  try {
    const [a, u, p] = await Promise.all([
      prisma.asset.findMany({
        where: { archivedAt: null },
        orderBy: { code: "asc" },
        select: { id: true, code: true, name: true },
      }),
      prisma.user.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
      prisma.project.findMany({
        where: { archivedAt: null },
        orderBy: { code: "asc" },
        select: { id: true, code: true, name: true },
      }),
    ]);
    assets = a;
    assignees = u;
    projects = p;
  } catch {
    assets = [];
    assignees = [];
    projects = [];
  }

  const defaultProjectId = sp.projectId ?? "";
  const returnTo = defaultProjectId
    ? `/portal/projects/${defaultProjectId}/work-orders`
    : "/portal/work-orders";

  const errMsg =
    sp.err === "required"
      ? "Titre et equipement sont obligatoires."
      : sp.err === "wo-title-format"
        ? "Le titre doit contenir entre 3 et 300 caracteres."
        : sp.err === "wo-title-used"
          ? "Un ordre avec ce titre existe deja pour cet equipement et ce rattachement projet."
          : sp.err === "asset"
            ? "Equipement invalide."
            : sp.err === "asset-inactive"
              ? "Equipement introuvable ou archive."
              : sp.err === "project"
                ? "Projet invalide ou archive."
                : sp.err === "asset-project-mismatch"
                  ? "Cet equipement est rattache a un autre projet. Choisissez le bon projet ou un autre equipement."
                  : sp.err === "assignee"
                    ? "Assigne invalide."
                    : sp.err === "duplicate"
                      ? "Conflit a l'enregistrement, reessayez."
                      : null;

  return (
    <section className="mx-auto max-w-lg space-y-6">
      <nav className="text-sm text-slate-500">
        <Link href="/portal" className="hover:text-[#0369a1]">
          Portail
        </Link>
        <span className="mx-2">/</span>
        <Link href="/portal/work-orders" className="hover:text-[#0369a1]">
          Ordres de travail
        </Link>
        <span className="mx-2">/</span>
        <span className="font-medium text-slate-800">Nouveau</span>
      </nav>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Nouvel ordre de travail</h1>

        {errMsg ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{errMsg}</p>
        ) : null}

        <form action={createWorkOrderFromForm} className="mt-6 space-y-4">
          <input type="hidden" name="returnTo" value={returnTo} />
          <div>
            <label htmlFor="title" className={label}>
              Titre
            </label>
            <input id="title" name="title" className={input} required maxLength={300} />
          </div>
          <div>
            <label htmlFor="description" className={label}>
              Description (optionnel)
            </label>
            <textarea id="description" name="description" className={input} rows={3} maxLength={4000} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="type" className={label}>
                Type
              </label>
              <select id="type" name="type" className={input} defaultValue="CORRECTIVE">
                <option value="CORRECTIVE">Correctif</option>
                <option value="PREVENTIVE">Preventif</option>
              </select>
            </div>
            <div>
              <label htmlFor="assetId" className={label}>
                Equipement
              </label>
              <select id="assetId" name="assetId" className={input} required defaultValue={assets[0]?.id ?? ""}>
                {assets.length === 0 ? <option value="">Aucun equipement</option> : null}
                {assets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.code} — {a.name}
                  </option>
                ))}
              </select>
            </div>
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
          <div>
            <label htmlFor="projectId" className={label}>
              Rattacher a un projet (optionnel)
            </label>
            <select id="projectId" name="projectId" className={input} defaultValue={defaultProjectId}>
              <option value="">Aucun</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} — {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              disabled={assets.length === 0}
              style={{
                display: "inline-flex",
                padding: "10px 20px",
                borderRadius: 9999,
                backgroundColor: assets.length === 0 ? "#94a3b8" : "#0369a1",
                color: "#fff",
                fontWeight: 600,
                fontSize: 14,
                border: "none",
                cursor: assets.length === 0 ? "not-allowed" : "pointer",
              }}
            >
              Creer l&apos;OT
            </button>
            <Link
              href={returnTo}
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
