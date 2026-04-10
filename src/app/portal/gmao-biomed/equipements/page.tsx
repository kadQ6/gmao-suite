import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canWriteBiomed } from "@/lib/biomed/rbac";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function BiomedEquipementsPage() {
  const session = await getServerSession(authOptions);
  const canWrite = canWriteBiomed(session?.user.role);
  const rows = await prisma.biomedEquipment.findMany({
    orderBy: { numeroGMAO: "asc" },
    take: 200,
    include: { site: { select: { code: true, nom: true } }, famille: { select: { code: true, nom: true } } },
  });

  return (
    <section className="space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-semibold text-kbio-navy">Parc equipements</h1>
        {canWrite ? (
          <Link
            href="/portal/gmao-biomed/equipements/nouveau"
            className="inline-flex items-center justify-center rounded-full bg-kbio-teal px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Nouvel equipement
          </Link>
        ) : null}
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">N° GMAO</th>
              <th className="px-4 py-3">Designation</th>
              <th className="px-4 py-3">Famille</th>
              <th className="px-4 py-3">Site</th>
              <th className="px-4 py-3">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  Aucun equipement.{" "}
                  <Link href="/portal/gmao-biomed/equipements/nouveau" className="text-kbio-teal hover:underline">
                    En creer un
                  </Link>
                  .
                </td>
              </tr>
            ) : (
              rows.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-mono text-xs">
                    <Link href={`/portal/gmao-biomed/equipements/${e.id}`} className="text-kbio-teal hover:underline">
                      {e.numeroGMAO}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-800">{e.designation}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {e.famille.code} — {e.famille.nom}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {e.site.code} — {e.site.nom}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{e.statut}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
