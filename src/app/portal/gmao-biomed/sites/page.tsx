import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function BiomedSitesPage() {
  const rows = await prisma.biomedSite.findMany({
    orderBy: { code: "asc" },
    include: {
      _count: { select: { batiments: true, locaux: true, equipements: true } },
    },
  });

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold text-kbio-navy">Sites & locaux</h1>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3 text-right">Batiments</th>
              <th className="px-4 py-3 text-right">Locaux</th>
              <th className="px-4 py-3 text-right">Equipements</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  Aucun site.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-mono text-xs">{r.code}</td>
                  <td className="px-4 py-3 text-slate-800">{r.nom}</td>
                  <td className="px-4 py-3 text-slate-600">{r.typeEtablissement}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{r._count.batiments}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{r._count.locaux}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{r._count.equipements}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
