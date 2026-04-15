import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PsaEquipmentStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

function statusDot(s: PsaEquipmentStatus) {
  switch (s) {
    case "FONCTIONNEL": return "bg-emerald-500";
    case "EN_PANNE": return "bg-red-500";
    case "HORS_SERVICE": return "bg-red-700";
    case "EN_ATTENTE": return "bg-gray-400";
    default: return "bg-slate-400";
  }
}

export default async function PsaSitePiecesPage({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await params;

  const site = await prisma.psaSite.findUnique({ where: { id: siteId } });
  if (!site) notFound();

  const pieces = await prisma.psaPieceNeed.findMany({
    where: { equipement: { siteId } },
    orderBy: [{ urgence: "desc" }, { designation: "asc" }],
    include: {
      equipement: {
        select: { id: true, code: true, designation: true, statut: true },
      },
    },
  });

  const totalCost = pieces.reduce((s, p) => s + (Number(p.prixUnitaire) || 0) * p.quantite, 0);
  const urgentCount = pieces.filter((p) => p.urgence).length;
  const urgentCost = pieces
    .filter((p) => p.urgence)
    .reduce((s, p) => s + (Number(p.prixUnitaire) || 0) * p.quantite, 0);

  const fmt = (n: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-6">
      <nav className="text-xs text-slate-500">
        <Link href="/rw" className="hover:text-[#0a2540]">Sites PSA</Link>
        <span className="mx-2">/</span>
        <Link href={`/rw/sites/${siteId}`} className="hover:text-[#0a2540]">{site.nom}</Link>
        <span className="mx-2">/</span>
        <span className="font-medium text-slate-700">Pièces détachées</span>
      </nav>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#0a2540]">Pièces détachées — {site.nom}</h2>
          <p className="text-sm text-slate-500 mt-1">
            Liste complète des pièces nécessaires pour remettre en route le PSA
          </p>
        </div>
        <div className="flex gap-3">
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-center">
            <p className="text-xl font-bold text-amber-700">{fmt(totalCost)}</p>
            <p className="text-xs text-amber-600">Coût total</p>
          </div>
          {urgentCount > 0 && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-center">
              <p className="text-xl font-bold text-red-700">{fmt(urgentCost)}</p>
              <p className="text-xs text-red-600">{urgentCount} pièce(s) urgente(s)</p>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {pieces.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-slate-500">Aucune pièce nécessaire pour ce site.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left">Pièce</th>
                  <th className="px-4 py-3 text-left">Réf.</th>
                  <th className="px-4 py-3 text-left">Équipement</th>
                  <th className="px-4 py-3 text-center">Qté</th>
                  <th className="px-4 py-3 text-right">PU</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-center">Urgence</th>
                  <th className="px-4 py-3 text-center">Disponibilité</th>
                  <th className="px-4 py-3 text-left">Fournisseur</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pieces.map((p) => (
                  <tr key={p.id} className={`transition-colors ${p.urgence ? "bg-red-50/30 hover:bg-red-50" : "hover:bg-slate-50"}`}>
                    <td className="px-4 py-3">
                      <span className="font-medium text-slate-800">{p.designation}</span>
                      {p.observations && (
                        <p className="text-xs text-slate-400 mt-0.5 max-w-xs">{p.observations}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{p.reference || "—"}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/rw/sites/${siteId}/equipements/${p.equipement.id}`}
                        className="inline-flex items-center gap-1.5 text-xs text-teal-600 hover:text-[#0a2540]"
                      >
                        <span className={`h-2 w-2 rounded-full ${statusDot(p.equipement.statut)}`} />
                        {p.equipement.designation}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-center tabular-nums">{p.quantite}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {p.prixUnitaire ? `${Number(p.prixUnitaire).toLocaleString("fr-FR")} €` : "—"}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold text-[#0a2540]">
                      {p.prixUnitaire ? fmt(Number(p.prixUnitaire) * p.quantite) : "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {p.urgence ? (
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
                          URGENT
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {p.enStock ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> En stock
                        </span>
                      ) : p.commandee ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Commandée
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> À commander
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{p.fournisseur || "—"}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 border-t-2 border-slate-200">
                <tr>
                  <td colSpan={5} className="px-4 py-3 text-right text-xs font-bold uppercase text-slate-600">
                    Total
                  </td>
                  <td className="px-4 py-3 text-right text-base font-bold text-[#0a2540]">
                    {fmt(totalCost)}
                  </td>
                  <td colSpan={3}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
