import { RemarkTab } from "@prisma/client";
import { notFound } from "next/navigation";
import { ProjectAccessCodes } from "@/components/portal/project-access-codes";
import { ProjectRemarks } from "@/components/portal/project-remarks";
import { PortalPrimaryLink } from "@/components/portal/portal-primary-link";
import { getPortalContext } from "@/lib/portal-scope";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{
    created?: string;
    credentials?: string;
    mail?: string;
    remarkErr?: string;
    remarkOk?: string;
    resent?: string;
    resentReason?: string;
  }>;
};

export default async function ProjectOverviewPage({ params, searchParams }: Props) {
  const { projectId } = await params;
  const sp = await searchParams;
  const ctx = await getPortalContext();

  const project = await prisma.project
    .findUnique({
      where: { id: projectId },
      include: {
        owner: { select: { name: true } },
        clients: { include: { client: { select: { name: true, code: true } } }, take: 1 },
        tasks: { where: { archivedAt: null }, select: { status: true } },
      },
    })
    .catch(() => null);

  if (!project) {
    notFound();
  }

  const tasks = project.tasks;
  const stats = {
    tasks: tasks.length,
    todo: tasks.filter((t: { status: string }) => t.status === "TODO").length,
    inProgress: tasks.filter((t: { status: string }) => t.status === "IN_PROGRESS").length,
    done: tasks.filter((t: { status: string }) => t.status === "DONE").length,
    blocked: tasks.filter((t: { status: string }) => t.status === "BLOCKED").length,
  };

  const clientLabel = project.clients[0]?.client.name ?? "Client non renseigne";

  const items = [
    { label: "Total taches", value: stats.tasks },
    { label: "A faire", value: stats.todo },
    { label: "En cours", value: stats.inProgress },
    { label: "Termine", value: stats.done },
    { label: "Bloque", value: stats.blocked },
  ];

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{clientLabel}</h2>
          <p className="mt-1 text-sm font-medium text-slate-700">{project.name}</p>
          <p className="mt-1 text-sm text-slate-600">
            Responsable projet :{" "}
            <span className="font-medium text-slate-800">{project.owner.name}</span>
          </p>
        </div>
        {ctx.canWrite ? (
          <PortalPrimaryLink href={`/portal/projects/${projectId}/tasks/new`}>
            Nouvelle tache
          </PortalPrimaryLink>
        ) : null}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {items.map((item) => (
          <article
            key={item.label}
            className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 text-center shadow-sm"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold text-kbio-navy">{item.value}</p>
          </article>
        ))}
      </div>
      {sp.created === "1" ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          Projet cree avec succes. Si un client est lie au projet, son mot de passe client (code d&apos;acces)
          est affiche ci-dessous.
        </p>
      ) : null}
      {sp.credentials === "1" ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Les identifiants du responsable client ont ete generes et envoyes par email.
        </p>
      ) : null}
      {sp.mail === "not-configured" ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-950">
          <p className="font-medium">Projet cree — email non configure sur le serveur</p>
          <p className="mt-2">
            Les variables <code className="rounded bg-amber-100 px-1">SMTP_HOST</code>,{" "}
            <code className="rounded bg-amber-100 px-1">SMTP_USER</code> et{" "}
            <code className="rounded bg-amber-100 px-1">SMTP_PASS</code> ne sont pas definies (ou vides) dans
            l&apos;environnement du processus Node (fichier <code className="rounded bg-amber-100 px-1">.env</code>{" "}
            sur le serveur, puis <code className="rounded bg-amber-100 px-1">pm2 restart</code> avec chargement des
            variables). Ajoutez aussi <code className="rounded bg-amber-100 px-1">SMTP_PORT</code> (souvent 587 ou
            465) et <code className="rounded bg-amber-100 px-1">SMTP_FROM</code>.
          </p>
          <p className="mt-2">
            En attendant, le code d&apos;acces client s&apos;affiche ci-dessous. Apres configuration SMTP, utilisez
            &quot;Renvoyer l&apos;email avec identifiants&quot;.
          </p>
        </div>
      ) : null}
      {sp.mail === "failed" ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-950">
          <p className="font-medium">Projet cree — le serveur mail a refuse l&apos;envoi</p>
          <p className="mt-2">
            SMTP est renseigne mais l&apos;envoi a echoue (mauvais mot de passe, port bloque, expediteur refuse).
            Consultez les logs serveur pour la ligne{" "}
            <code className="rounded bg-amber-100 px-1">[mail-error]</code>, corrigez la configuration, redemarrez
            l&apos;application, puis utilisez &quot;Renvoyer l&apos;email avec identifiants&quot; dans la section
            codes client.
          </p>
        </div>
      ) : null}
      {sp.resent === "ok" ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          Email envoye : mot de passe temporaire regenere et code d&apos;acces inclus. Le client doit utiliser le
          nouveau mot de passe.
        </p>
      ) : null}
      {sp.resent === "partial" ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Certains emails sont partis, d&apos;autres ont echoue (SMTP). Verifiez la configuration puis renvoyez
          encore pour les comptes restants.
        </p>
      ) : null}
      {sp.resent === "fail" ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {sp.resentReason === "smtp-not-configured"
            ? "SMTP non configure sur le serveur (variables SMTP_HOST, SMTP_USER, SMTP_PASS). Definissez-les puis redemarrez l&apos;application."
            : sp.resentReason === "smtp"
              ? "Echec d&apos;envoi (SMTP). Verifiez identifiants, port et logs [mail-error] puis reessayez."
              : sp.resentReason === "no-access"
                ? "Aucun code d&apos;acces client pour ce projet."
                : sp.resentReason === "no-client-user"
                  ? "Aucun utilisateur role client lie a ce projet pour recevoir l&apos;email."
                  : "Le renvoi a echoue."}
        </p>
      ) : null}
      <ProjectAccessCodes projectId={projectId} canWrite={ctx.canWrite} />
      {sp.remarkErr ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          Remarque invalide. Verifiez le contenu puis recommencez.
        </p>
      ) : null}
      {sp.remarkOk === "1" ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Remarque ajoutee.
        </p>
      ) : null}
      <ProjectRemarks projectId={projectId} tab={RemarkTab.OVERVIEW} returnTo={`/portal/projects/${projectId}`} />
    </section>
  );
}
