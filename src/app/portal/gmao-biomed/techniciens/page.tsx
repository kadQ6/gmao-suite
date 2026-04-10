import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function BiomedTechniciensPage() {
  const rows = await prisma.biomedTechnician.findMany({
    orderBy: [{ nom: "asc" }, { prenom: "asc" }],
    take: 200,
  });

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold text-kbio-navy">Techniciens</h1>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Specialite</th>
              <th className="px-4 py-3">Niveau</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Actif</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  Aucun technicien.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {r.prenom} {r.nom}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{r.specialite}</td>
                  <td className="px-4 py-3 text-slate-600">{r.niveauQualification}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {[r.email, r.telephone].filter(Boolean).join(" · ") || "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{r.actif ? "oui" : "non"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
