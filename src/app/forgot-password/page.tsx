import Link from "next/link";
import { requestPasswordResetFromForm } from "@/lib/password-reset-actions";

type Props = { searchParams: Promise<{ status?: string; err?: string }> };

export default async function ForgotPasswordPage({ searchParams }: Props) {
  const sp = await searchParams;
  const status = sp.status;
  const err = sp.err;

  return (
    <section className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-xl font-semibold text-kbio-navy">Mot de passe oublie</h1>
      <p className="mt-2 text-sm text-slate-600">
        Saisissez deux fois votre email et le code projet du portail. Le double saisie de l&apos;email limite les
        fautes de frappe ; le code projet confirme que vous etes bien rattache a ce dossier.
      </p>

      {status === "ok" ? (
        <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Un lien de reinitialisation vient d&apos;etre envoye a votre adresse email.
        </p>
      ) : null}
      {status === "expired" ? (
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Le lien est invalide ou expire. Demandez un nouveau lien.
        </p>
      ) : null}
      {err === "required" ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          Renseignez les deux champs email et le code projet.
        </p>
      ) : null}
      {err === "email-mismatch" ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          Les deux emails ne correspondent pas. Verifiez votre saisie.
        </p>
      ) : null}
      {err === "bad-credentials" ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          Combinaison invalide : compte introuvable, inactif, sans mot de passe, ou non lie a ce projet avec ce
          code.
        </p>
      ) : null}
      {err === "mail-not-configured" ? (
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          L&apos;envoi d&apos;email n&apos;est pas configure sur ce serveur (definissez SMTP_HOST, SMTP_USER,
          SMTP_PASS dans l&apos;environnement, puis redemarrez l&apos;application). Contactez l&apos;administrateur.
        </p>
      ) : null}
      {err === "mail-failed" ? (
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Le serveur mail a refuse l&apos;envoi. Reessayez plus tard ou contactez le support (voir logs{" "}
          <code className="rounded bg-amber-100 px-1">[mail-error]</code>).
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
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Confirmer l&apos;email</label>
          <input
            name="confirmEmail"
            type="email"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            autoComplete="email"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Code projet</label>
          <input
            name="projectCode"
            type="text"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm uppercase"
            autoComplete="off"
            placeholder="Ex. PRJ-042"
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
