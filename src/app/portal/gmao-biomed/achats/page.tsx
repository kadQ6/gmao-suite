import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function BiomedAchatsPage() {
  const rows = await prisma.biomedPurchaseRequest.findMany({
    orderBy: { date: "desc" },
    take: 150,
  });

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold text-kbio-navy">Achats / demandes d&apos;achat</h1>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">N° DA</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Designation</th>
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
                  <td className="px-4 py-3 font-mono text-xs">{r.numeroDA}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {r.date instanceof Date ? r.date.toLocaleDateString("fr-FR") : String(r.date)}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{r.typeAchat}</td>
                  <td className="px-4 py-3 text-slate-800">{r.designation ?? "—"}</td>
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
