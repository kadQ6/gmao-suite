import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function BiomedCurativePage() {
  const rows = await prisma.biomedCorrectiveMaintenance.findMany({
    orderBy: { dateDebut: "desc" },
    take: 150,
    include: {
      equipement: { select: { id: true, numeroGMAO: true, designation: true } },
    },
  });

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold text-kbio-navy">Maintenance curative (MC)</h1>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">N° MC</th>
              <th className="px-4 py-3">Debut</th>
              <th className="px-4 py-3">Equipement</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3 text-right">Cout</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  Aucune MC.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-mono text-xs">{r.numeroMC}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {r.dateDebut ? r.dateDebut.toLocaleDateString("fr-FR") : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/portal/gmao-biomed/equipements/${r.equipement.id}`}
                      className="text-kbio-teal hover:underline"
                    >
                      {r.equipement.numeroGMAO}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{r.statutFinal}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-slate-600">
                    {r.coutTotal != null
                      ? Number(r.coutTotal).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })
                      : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
