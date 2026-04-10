import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canWriteBiomed } from "@/lib/biomed/rbac";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export default async function BiomedEquipementDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const canWrite = canWriteBiomed(session?.user.role);

  const e = await prisma.biomedEquipment.findUnique({
    where: { id },
    include: {
      site: true,
      local: true,
      famille: true,
      protocole: { select: { code: true, designation: true } },
    },
  });
  if (!e) notFound();

  return (
    <section className="space-y-6">
      <div>
        <Link href="/portal/gmao-biomed/equipements" className="text-sm text-kbio-teal hover:underline">
          ← Parc equipements
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-kbio-navy">{e.designation}</h1>
        <p className="mt-1 font-mono text-sm text-slate-500">{e.numeroGMAO}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <dl className="rounded-xl border border-slate-200 bg-white p-5 text-sm shadow-sm">
          <dt className="text-xs font-semibold uppercase text-slate-400">Site</dt>
          <dd className="mt-1 text-slate-800">
            {e.site.nom} ({e.site.code})
          </dd>
          <dt className="mt-4 text-xs font-semibold uppercase text-slate-400">Local</dt>
          <dd className="mt-1 text-slate-800">{e.local ? `${e.local.nom} (${e.local.code})` : "—"}</dd>
          <dt className="mt-4 text-xs font-semibold uppercase text-slate-400">Famille</dt>
          <dd className="mt-1 text-slate-800">
            {e.famille.nom} ({e.famille.code})
          </dd>
        </dl>
        <dl className="rounded-xl border border-slate-200 bg-white p-5 text-sm shadow-sm">
          <dt className="text-xs font-semibold uppercase text-slate-400">Statut / criticite</dt>
          <dd className="mt-1 text-slate-800">
            {e.statut} · {e.criticite}
          </dd>
          <dt className="mt-4 text-xs font-semibold uppercase text-slate-400">Marque / modele</dt>
          <dd className="mt-1 text-slate-800">
            {[e.marque, e.modele].filter(Boolean).join(" · ") || "—"}
          </dd>
          <dt className="mt-4 text-xs font-semibold uppercase text-slate-400">Protocole</dt>
          <dd className="mt-1 text-slate-800">
            {e.protocole ? `${e.protocole.code} — ${e.protocole.designation}` : "—"}
          </dd>
        </dl>
      </div>
      {e.observations ? (
        <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-700 shadow-sm">
          <h2 className="font-semibold text-slate-900">Observations</h2>
          <p className="mt-2 whitespace-pre-wrap">{e.observations}</p>
        </div>
      ) : null}

      {canWrite ? (
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/portal/gmao-biomed/interventions/nouvelle?equipementId=${encodeURIComponent(e.id)}`}
            className="inline-flex rounded-full border border-kbio-teal bg-white px-4 py-2 text-sm font-medium text-kbio-teal hover:bg-teal-50"
          >
            Declarer une DI
          </Link>
        </div>
      ) : null}
    </section>
  );
}
