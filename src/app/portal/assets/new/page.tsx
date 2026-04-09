import Link from "next/link";
import { createAssetFromForm } from "@/lib/portal-actions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const label = "block text-sm font-medium text-slate-700";
const input =
  "mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-[#0369a1] focus:outline-none focus:ring-1 focus:ring-[#0369a1]";

type Props = { searchParams: Promise<{ err?: string; projectId?: string }> };

export default async function NewAssetPage({ searchParams }: Props) {
  const sp = await searchParams;
  let projects: Array<{ id: string; code: string; name: string }> = [];
  try {
    projects = await prisma.project.findMany({
      where: { archivedAt: null },
      orderBy: { code: "asc" },
      select: { id: true, code: true, name: true },
    });
  } catch {
    projects = [];
  }

  const defaultProjectId = sp.projectId ?? "";

  const errMsg =
    sp.err === "required"
      ? "Code, nom et categorie sont obligatoires."
      : sp.err === "duplicate"
        ? "Ce code equipement existe deja."
        : sp.err === "asset-code-format"
          ? "Format code invalide. Lettres/chiffres avec - ou _ (2 a 64 caracteres)."
          : sp.err === "asset-code-used"
            ? "Ce code est deja utilise sur un equipement actif."
            : sp.err === "asset-name-format"
              ? "Le nom doit contenir au moins 3 caracteres."
              : sp.err === "asset-name-used"
                ? "Un equipement avec ce nom existe deja sur ce projet."
                : sp.err === "asset-category-format"
                  ? "Categorie invalide (2 a 120 caracteres)."
                  : sp.err === "asset-location-format"
                    ? "Localisation trop longue (max 200 caracteres)."
                    : sp.err === "project"
                      ? "Projet invalide ou archive."
                      : null;

  return (
    <section className="mx-auto max-w-lg space-y-6">
      <nav className="text-sm text-slate-500">
        <Link href="/portal" className="hover:text-[#0369a1]">
          Portail
        </Link>
        <span className="mx-2">/</span>
        <Link href="/portal/assets" className="hover:text-[#0369a1]">
          Equipements
        </Link>
        <span className="mx-2">/</span>
        <span className="font-medium text-slate-800">Nouveau</span>
      </nav>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Nouvel equipement</h1>

        {errMsg ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{errMsg}</p>
        ) : null}

        <form action={createAssetFromForm} className="mt-6 space-y-4">
          <div>
            <label htmlFor="code" className={label}>
              Code
            </label>
            <input id="code" name="code" className={input} required maxLength={64} />
          </div>
          <div>
            <label htmlFor="name" className={label}>
              Nom
            </label>
            <input id="name" name="name" className={input} required maxLength={200} />
          </div>
          <div>
            <label htmlFor="category" className={label}>
              Categorie
            </label>
            <input id="category" name="category" className={input} required maxLength={120} />
          </div>
          <div>
            <label htmlFor="location" className={label}>
              Localisation (optionnel)
            </label>
            <input id="location" name="location" className={input} maxLength={200} />
          </div>
          <div>
            <label htmlFor="projectId" className={label}>
              Rattacher a un projet (optionnel)
            </label>
            <select
              id="projectId"
              name="projectId"
              className={input}
              defaultValue={defaultProjectId}
            >
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
              Enregistrer
            </button>
            <Link
              href="/portal/assets"
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
