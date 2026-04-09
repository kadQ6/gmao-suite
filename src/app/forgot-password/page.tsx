import Link from "next/link";
import { requestPasswordResetFromForm } from "@/lib/password-reset-actions";

type Props = { searchParams: Promise<{ status?: string }> };

export default async function ForgotPasswordPage({ searchParams }: Props) {
  const sp = await searchParams;
  const status = sp.status;

  return (
    <section className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-xl font-semibold text-kbio-navy">Mot de passe oublie</h1>
      <p className="mt-2 text-sm text-slate-600">
        Saisissez votre email. Si un compte existe, un lien de reinitialisation sera envoye.
      </p>

      {status === "ok" ? (
        <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Si cet email existe, un lien de reinitialisation a ete envoye.
        </p>
      ) : null}
      {status === "expired" ? (
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Le lien est invalide ou expire. Demandez un nouveau lien.
        </p>
      ) : null}

      <form action={requestPasswordResetFromForm} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            autoComplete="email"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-full bg-kbio-navy px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-kbio-navy/90"
        >
          Envoyer le lien
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
