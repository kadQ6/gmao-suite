import Link from "next/link";
import { createProjectFromForm } from "@/lib/portal-actions";

export const dynamic = "force-dynamic";

const label = "block text-sm font-medium text-slate-700";
const input =
  "mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-[#0369a1] focus:outline-none focus:ring-1 focus:ring-[#0369a1]";

type Props = { searchParams: Promise<{ err?: string }> };

export default async function NewProjectPage({ searchParams }: Props) {
  const sp = await searchParams;
  const errMsg =
    sp.err === "required"
      ? "Code et nom sont obligatoires."
      : sp.err === "duplicate"
        ? "Ce code projet est deja utilise."
        : sp.err === "project-code-used"
          ? "Ce code projet est deja utilise sur un projet existant."
          : sp.err === "project-code-format"
            ? "Format code invalide. Utilisez lettres/chiffres avec - ou _ (2 a 64 caracteres)."
            : sp.err === "project-name-format"
              ? "Le nom du projet doit contenir au moins 3 caracteres."
              : sp.err === "project-name-used"
                ? "Un projet actif avec ce nom existe deja."
        : sp.err === "client-contact-required"
            ? "Le nom et l'email du responsable client sont obligatoires."
            : sp.err === "client-name-required"
              ? "Le nom du client est obligatoire pour creer le client projet."
              : sp.err === "client-name-used"
                ? "Ce nom client existe deja. Utilisez le nom officiel exact (ou ajoutez une precision)."
                : sp.err === "client-contact-email-format"
                  ? "Format email responsable client invalide."
                  : sp.err === "client-contact-phone-format"
                    ? "Format telephone invalide."
            : sp.err === "client-contact-email-used"
              ? "Cet email appartient a un compte interne. Utilisez un email client ou un compte client existant."
        : null;

  return (
    <section className="mx-auto max-w-lg space-y-6">
      <nav className="text-sm text-slate-500">
        <Link href="/portal" className="hover:text-[#0369a1]">
          Portail
        </Link>
        <span className="mx-2">/</span>
        <Link href="/portal/projects" className="hover:text-[#0369a1]">
          Projets
        </Link>
        <span className="mx-2">/</span>
        <span className="font-medium text-slate-800">Nouveau</span>
      </nav>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Nouveau projet</h1>
        <p className="mt-1 text-sm text-slate-600">Le projet sera rattache a votre compte comme responsable.</p>

        {errMsg ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{errMsg}</p>
        ) : null}

        <form action={createProjectFromForm} className="mt-6 space-y-4">
          <div>
            <label htmlFor="code" className={label}>
              Code projet
            </label>
            <input id="code" name="code" className={input} required maxLength={64} placeholder="ex. PRJ-042" />
          </div>
          <div>
            <label htmlFor="name" className={label}>
              Nom
            </label>
            <input id="name" name="name" className={input} required maxLength={200} />
          </div>
          <div>
            <label htmlFor="description" className={label}>
              Description (optionnel)
            </label>
            <textarea id="description" name="description" className={input} rows={3} maxLength={4000} />
          </div>
          <div>
            <label htmlFor="clientName" className={label}>
              Nom du client (optionnel)
            </label>
            <input
              id="clientName"
              name="clientName"
              className={input}
              maxLength={200}
              placeholder="Ex. Hopital Regional de Djibouti"
            />
            <p className="mt-1 text-xs text-slate-500">
              Si un nom client est saisi, le client est cree automatiquement et lie au projet.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="clientContactName" className={label}>
                Responsable client - Nom complet
              </label>
              <input
                id="clientContactName"
                name="clientContactName"
                className={input}
                maxLength={160}
                placeholder="Ex. Fatou Ali"
              />
            </div>
            <div>
              <label htmlFor="clientContactEmail" className={label}>
                Responsable client - Email
              </label>
              <input
                id="clientContactEmail"
                name="clientContactEmail"
                type="email"
                className={input}
                maxLength={190}
                placeholder="fatou@client.com"
              />
            </div>
            <div>
              <label htmlFor="clientContactPhone" className={label}>
                Responsable client - Telephone
              </label>
              <input
                id="clientContactPhone"
                name="clientContactPhone"
                className={input}
                maxLength={40}
                placeholder="+253 ..."
              />
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
              Creer le projet
            </button>
            <Link
              href="/portal/projects"
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
