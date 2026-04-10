import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { BiomedDiStatus, BiomedMcFinalStatus } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { canWriteBiomed } from "@/lib/biomed/rbac";
import { createBiomedCorrectiveFromDi } from "@/lib/biomed/actions";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export default async function BiomedInterventionDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const canWrite = canWriteBiomed(session?.user.role);

  const di = await prisma.biomedInterventionRequest.findUnique({
    where: { id },
    include: {
      equipement: { select: { id: true, numeroGMAO: true, designation: true } },
      maintenancesCur: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!di) notFound();

  const closed = di.statut === BiomedDiStatus.CLOTUREE || di.statut === BiomedDiStatus.ANNULEE;
  const canAddMc = canWrite && !closed && di.maintenancesCur.length === 0;

  return (
    <section className="space-y-6">
      <div>
        <Link href="/portal/gmao-biomed/interventions" className="text-sm text-kbio-teal hover:underline">
          ← Demandes d&apos;intervention
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-kbio-navy">{di.numeroDI}</h1>
        <p className="mt-1 text-sm text-slate-600">
          Creee le {di.dateCreation.toLocaleString("fr-FR")} · {di.statut}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <dl className="rounded-xl border border-slate-200 bg-white p-5 text-sm shadow-sm">
          <dt className="text-xs font-semibold uppercase text-slate-400">Equipement</dt>
          <dd className="mt-1">
            <Link
              href={`/portal/gmao-biomed/equipements/${di.equipement.id}`}
              className="font-medium text-kbio-teal hover:underline"
            >
              {di.equipement.numeroGMAO}
            </Link>
            <p className="text-slate-600">{di.equipement.designation}</p>
          </dd>
          <dt className="mt-4 text-xs font-semibold uppercase text-slate-400">Urgence</dt>
          <dd className="mt-1 text-slate-800">{di.niveauUrgence}</dd>
          {di.demandeurNom ? (
            <>
              <dt className="mt-4 text-xs font-semibold uppercase text-slate-400">Demandeur</dt>
              <dd className="mt-1 text-slate-800">{di.demandeurNom}</dd>
            </>
          ) : null}
        </dl>
        <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm shadow-sm">
          <h2 className="text-xs font-semibold uppercase text-slate-400">Description</h2>
          <p className="mt-2 whitespace-pre-wrap text-slate-800">{di.descriptionPanne}</p>
        </div>
      </div>

      {di.maintenancesCur.length > 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Maintenance curative liee</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {di.maintenancesCur.map((mc) => (
              <li key={mc.id} className="flex flex-wrap items-baseline gap-2">
                <span className="font-mono text-xs text-slate-600">{mc.numeroMC}</span>
                <span className="text-slate-600">{mc.statutFinal}</span>
                {mc.dateFin ? (
                  <span className="text-xs text-slate-500">
                    fin {mc.dateFin.toLocaleDateString("fr-FR")}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
          <Link
            href="/portal/gmao-biomed/maintenance/curative"
            className="mt-3 inline-block text-sm text-kbio-teal hover:underline"
          >
            Voir toutes les MC →
          </Link>
        </div>
      ) : null}

      {canAddMc ? (
        <div className="rounded-xl border border-kbio-teal/30 bg-teal-50/40 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-kbio-navy">Enregistrer une MC (cloture)</h2>
          <p className="mt-1 text-sm text-slate-600">
            Lie une maintenance curative a cette DI et met a jour le statut de la demande.
          </p>
          <form action={createBiomedCorrectiveFromDi} className="mt-4 space-y-4">
            <input type="hidden" name="diId" value={di.id} />
            <div>
              <label htmlFor="diagnostic" className="block text-sm font-medium text-slate-700">
                Diagnostic *
              </label>
              <textarea
                id="diagnostic"
                name="diagnostic"
                required
                rows={3}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="actionCorrective" className="block text-sm font-medium text-slate-700">
                Action corrective *
              </label>
              <textarea
                id="actionCorrective"
                name="actionCorrective"
                required
                rows={3}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="statutFinal" className="block text-sm font-medium text-slate-700">
                Statut MC
              </label>
              <select
                id="statutFinal"
                name="statutFinal"
                defaultValue={BiomedMcFinalStatus.RESOLU}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
              >
                {Object.values(BiomedMcFinalStatus).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="coutTotal" className="block text-sm font-medium text-slate-700">
                Cout total (EUR, optionnel)
              </label>
              <input
                id="coutTotal"
                name="coutTotal"
                type="text"
                inputMode="decimal"
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                placeholder="ex. 120,50"
              />
            </div>
            <button
              type="submit"
              className="rounded-full bg-kbio-teal px-6 py-2.5 text-sm font-medium text-white hover:opacity-90"
            >
              Creer la MC et mettre a jour la DI
            </button>
          </form>
        </div>
      ) : null}

      {!canWrite && !closed && di.maintenancesCur.length === 0 ? (
        <p className="text-sm text-slate-500">
          Connectez-vous avec un compte habilite pour enregistrer une MC sur cette DI.
        </p>
      ) : null}
    </section>
  );
}
