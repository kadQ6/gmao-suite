import { ConfirmSubmitButton } from "@/components/portal/confirm-submit-button";
import { resendProjectClientCredentialsFromForm } from "@/lib/portal-actions";

type Props = {
  projectId: string;
};

export function ResendClientCredentialsForm({ projectId }: Props) {
  return (
    <form action={resendProjectClientCredentialsFromForm} className="mt-3">
      <input type="hidden" name="projectId" value={projectId} />
      <ConfirmSubmitButton
        className="rounded-lg border border-emerald-300 bg-white px-4 py-2 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-100"
        message={
          "Un nouveau mot de passe temporaire sera genere pour chaque utilisateur client lie au projet, " +
          "puis l'email sera envoye. L'ancien mot de passe ne fonctionnera plus. Continuer ?"
        }
      >
        Renvoyer l&apos;email avec identifiants
      </ConfirmSubmitButton>
      <p className="mt-2 max-w-xl text-xs text-slate-600">
        Verifiez sur le serveur : SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM. Sans ces variables,
        les emails sont journalises mais non envoyes.
      </p>
    </form>
  );
}
