import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function BiomedStockMouvementsPage() {
  const rows = await prisma.biomedStockMovement.findMany({
    orderBy: { date: "desc" },
    take: 150,
    include: {
      piece: { select: { reference: true, designation: true } },
    },
  });

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold text-kbio-navy">Mouvements de stock</h1>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Piece</th>
              <th className="px-4 py-3 text-right">Qté</th>
              <th className="px-4 py-3">Motif</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  Aucun mouvement.{" "}
                  <Link href="/portal/gmao-biomed/stock/pieces" className="text-kbio-teal hover:underline">
                    Voir les pieces
                  </Link>
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3 text-slate-600">{r.date.toLocaleString("fr-FR")}</td>
                  <td className="px-4 py-3 text-slate-600">{r.type}</td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs">{r.piece.reference}</span>
                    <span className="block text-xs text-slate-500">{r.piece.designation}</span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{r.quantite}</td>
                  <td className="px-4 py-3 text-slate-600">{r.motif ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
