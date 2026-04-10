import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function BiomedPiecesPage() {
  const rows = await prisma.biomedSparePart.findMany({
    orderBy: { reference: "asc" },
    take: 300,
  });

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold text-kbio-navy">Pieces detachees</h1>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Reference</th>
              <th className="px-4 py-3">Designation</th>
              <th className="px-4 py-3 text-right">Stock</th>
              <th className="px-4 py-3 text-right">Min</th>
              <th className="px-4 py-3">Criticité</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  Aucune piece.
                </td>
              </tr>
            ) : (
              rows.map((r) => {
                const low = r.stockDisponible <= r.stockMinimum;
                return (
                  <tr key={r.id} className={low ? "bg-amber-50/60" : "hover:bg-slate-50/80"}>
                    <td className="px-4 py-3 font-mono text-xs">{r.reference}</td>
                    <td className="px-4 py-3 text-slate-800">{r.designation}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-medium">{r.stockDisponible}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-500">{r.stockMinimum}</td>
                    <td className="px-4 py-3 text-slate-600">{r.criticiteStock}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
