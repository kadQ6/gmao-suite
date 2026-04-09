import { ResendClientCredentialsForm } from "@/components/portal/resend-client-credentials-form";
import { prisma } from "@/lib/prisma";

type Props = {
  projectId: string;
  canWrite: boolean;
};

export async function ProjectAccessCodes({ projectId, canWrite }: Props) {
  if (!canWrite) return null;

  const codes = await prisma.clientPortalAccessCode.findMany({
    where: { projectId, active: true },
    include: { client: { select: { code: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });

  if (codes.length === 0) {
    return (
      <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
        Aucun client lie a ce projet: aucun mot de passe client (code d&apos;acces) genere pour le moment.
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
        Mots de passe client (codes d&apos;acces)
      </p>
      <div className="mt-2 space-y-1 text-sm text-emerald-900">
        {codes.map((item) => (
          <p key={item.id}>
            {item.client.code} - {item.client.name}: <span className="font-semibold">{item.code}</span>
          </p>
        ))}
      </div>
      <ResendClientCredentialsForm projectId={projectId} />
    </div>
  );
}
