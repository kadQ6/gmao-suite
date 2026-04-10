import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canWriteBiomed } from "@/lib/biomed/rbac";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function BiomedInterventionsPage() {
  const session = await getServerSession(authOptions);
  const canWrite = canWriteBiomed(session?.user.role);

  const rows = await prisma.biomedInterventionRequest.findMany({
    orderBy: { dateCreation: "desc" },
    take: 150,
    include: {
      equipement: { select: { numeroGMAO: true, designation: true } },
    },
  });

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="text-2xl font-semibold text-kbio-navy">Demandes d&apos;intervention</h1>
        {canWrite ? (
          <Link
            href="/portal/gmao-biomed/interventions/nouvelle"
            className="inline-flex w-fit items-center justify-center rounded-full bg-kbio-teal px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Nouvelle DI
          </Link>
        ) : null}
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">N° DI</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Equipement</th>
              <th className="px-4 py-3">Urgence</th>
              <th className="px-4 py-3">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  Aucune demande.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-mono text-xs">
                    <Link href={`/portal/gmao-biomed/interventions/${r.id}`} className="text-kbio-teal hover:underline">
                      {r.numeroDI}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {r.dateCreation.toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/portal/gmao-biomed/equipements/${r.equipementId}`}
                      className="text-kbio-teal hover:underline"
                    >
                      {r.equipement.numeroGMAO}
                    </Link>
                    <span className="block text-xs text-slate-500">{r.equipement.designation}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{r.niveauUrgence}</td>
                  <td className="px-4 py-3 text-slate-600">{r.statut}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
