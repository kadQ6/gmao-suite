import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function BiomedPlanInvestPage() {
  const rows = await prisma.biomedInvestmentPlan.findMany({
    orderBy: [{ annee: "desc" }, { priorite: "asc" }],
    take: 150,
    include: {
      site: { select: { code: true, nom: true } },
      equipementActuel: { select: { id: true, numeroGMAO: true } },
    },
  });

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold text-kbio-navy">Plan d&apos;investissement</h1>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Annee</th>
              <th className="px-4 py-3">Site</th>
              <th className="px-4 py-3">Designation</th>
              <th className="px-4 py-3">Priorite</th>
              <th className="px-4 py-3">Budget</th>
              <th className="px-4 py-3">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  Aucune ligne.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3 tabular-nums">{r.annee}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {r.site.code} — {r.site.nom}
                  </td>
                  <td className="px-4 py-3 text-slate-800">
                    {r.designationNouveau ?? r.equipementActuel?.numeroGMAO ?? "—"}
                    {r.equipementActuel ? (
                      <Link
                        href={`/portal/gmao-biomed/equipements/${r.equipementActuel.id}`}
                        className="ml-2 text-xs text-kbio-teal hover:underline"
                      >
                        fiche
                      </Link>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{r.priorite}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-slate-600">
                    {r.coutRemplacement != null
                      ? Number(r.coutRemplacement).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{r.statutBudgetaire}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
