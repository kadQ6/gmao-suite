import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function BiomedProtocolesPage() {
  const rows = await prisma.biomedProtocol.findMany({
    orderBy: { code: "asc" },
    take: 200,
    include: { famille: { select: { code: true, nom: true } } },
  });

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold text-kbio-navy">Protocoles de maintenance</h1>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Designation</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Frequence</th>
              <th className="px-4 py-3">Famille</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  Aucun protocole.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-mono text-xs">{r.code}</td>
                  <td className="px-4 py-3 text-slate-800">{r.designation}</td>
                  <td className="px-4 py-3 text-slate-600">{r.typeMaintenance}</td>
                  <td className="px-4 py-3 text-slate-600">{r.frequence}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {r.famille ? `${r.famille.code} — ${r.famille.nom}` : "—"}
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
