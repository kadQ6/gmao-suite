import Link from "next/link";
import { resetPasswordFromForm } from "@/lib/password-reset-actions";

type Props = { searchParams: Promise<{ token?: string; err?: string }> };

export default async function ResetPasswordPage({ searchParams }: Props) {
  const sp = await searchParams;
  const token = sp.token ?? "";
  const err = sp.err;

  return (
    <section className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-xl font-semibold text-kbio-navy">Reinitialiser le mot de passe</h1>
      <p className="mt-2 text-sm text-slate-600">
        Entrez un nouveau mot de passe (10 caracteres minimum).
      </p>

      {err === "invalid" ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          Informations invalides. Verifiez le lien et vos mots de passe.
        </p>
      ) : null}

      <form action={resetPasswordFromForm} className="mt-6 space-y-4">
        <input type="hidden" name="token" value={token} />
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Nouveau mot de passe</label>
          <input
            name="password"
            type="password"
            required
            minLength={10}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            autoComplete="new-password"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Confirmer</label>
          <input
            name="confirmPassword"
            type="password"
            required
            minLength={10}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            autoComplete="new-password"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-full bg-kbio-navy px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-kbio-navy/90"
        >
          Mettre a jour le mot de passe
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        <Link href="/login" className="font-medium text-kbio-teal hover:underline">
          Retour a la connexion
        </Link>
      </p>
    </section>
  );
}
