import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PsaEquipmentStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { EquipmentStatusForm } from "@/components/psa/equipment-status-form";

export const dynamic = "force-dynamic";

function statusBadge(s: PsaEquipmentStatus) {
  const base = "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border";
  switch (s) {
    case "FONCTIONNEL":
      return `${base} bg-emerald-100 text-emerald-800 border-emerald-300`;
    case "EN_PANNE":
      return `${base} bg-red-100 text-red-800 border-red-300`;
    case "HORS_SERVICE":
      return `${base} bg-red-200 text-red-900 border-red-400`;
    case "EN_ATTENTE":
      return `${base} bg-gray-200 text-gray-700 border-gray-300`;
    default:
      return `${base} bg-slate-100 text-slate-700 border-slate-300`;
  }
}

function statusLabel(s: PsaEquipmentStatus) {
  switch (s) {
    case "FONCTIONNEL": return "Fonctionnel";
    case "EN_PANNE": return "En panne";
    case "EN_ATTENTE": return "En attente";
    case "HORS_SERVICE": return "Hors service";
    default: return s;
  }
}

function rowBg(s: PsaEquipmentStatus) {
  switch (s) {
    case "FONCTIONNEL": return "bg-emerald-50/30 hover:bg-emerald-50/60";
    case "EN_PANNE": return "bg-red-50/40 hover:bg-red-50/70";
    case "HORS_SERVICE": return "bg-red-100/30 hover:bg-red-100/50";
    case "EN_ATTENTE": return "bg-gray-50/50 hover:bg-gray-100/60";
    default: return "hover:bg-slate-50";
  }
}

function statusDot(s: PsaEquipmentStatus) {
  switch (s) {
    case "FONCTIONNEL": return "bg-emerald-500";
    case "EN_PANNE": return "bg-red-500";
    case "HORS_SERVICE": return "bg-red-700";
    case "EN_ATTENTE": return "bg-gray-400";
    default: return "bg-slate-400";
  }
}

export default async function PsaSiteDetailPage({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await params;
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === "SUPER_ADMIN" || session?.user?.role === "ADMIN";

  const site = await prisma.psaSite.findUnique({
    where: { id: siteId },
    include: {
      equipements: {
        orderBy: { code: "asc" },
        include: {
          _count: { select: { maintenances: true, piecesBesoins: true } },
          piecesBesoins: { select: { quantite: true, prixUnitaire: true, urgence: true } },
        },
      },
    },
  });
  if (!site) notFound();

  const fonc = site.equipements.filter((e) => e.statut === "FONCTIONNEL").length;
  const panne = site.equipements.filter((e) => e.statut === "EN_PANNE" || e.statut === "HORS_SERVICE").length;
  const attente = site.equipements.filter((e) => e.statut === "EN_ATTENTE").length;

  const totalCostPieces = site.equipements.reduce((sum, eq) => {
    return sum + eq.piecesBesoins.reduce((s, p) => s + (Number(p.prixUnitaire) || 0) * p.quantite, 0);
  }, 0);

  const urgentPiecesCount = site.equipements.reduce((sum, eq) => {
    return sum + eq.piecesBesoins.filter((p) => p.urgence).length;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="text-xs text-slate-500">
        <Link href="/rw" className="hover:text-[#0a2540]">Sites PSA</Link>
        <span className="mx-2">/</span>
        <span className="font-medium text-slate-700">{site.nom}</span>
      </nav>

      {/* Site header card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <span className="inline-block rounded-md bg-[#0a2540]/10 px-2 py-0.5 text-xs font-mono font-bold text-[#0a2540] mb-2">
              {site.code}
            </span>
            <h2 className="text-xl font-bold text-[#0a2540]">{site.nom}</h2>
            <div className="flex flex-wrap gap-3 mt-2 text-sm text-slate-600">
              {site.localisation && <span>📍 {site.localisation}</span>}
              {site.capaciteO2 && <span className="text-teal-600 font-medium">O₂ {site.capaciteO2}</span>}
              {site.contactNom && <span>👤 {site.contactNom}</span>}
              {site.contactTel && <span>📞 {site.contactTel}</span>}
            </div>
            {site.description && (
              <p className="mt-3 text-sm text-slate-500 max-w-2xl">{site.description}</p>
            )}
          </div>

          <Link
            href={`/rw/sites/${site.id}/pieces`}
            className="portal-btn-secondary flex-shrink-0 text-sm"
          >
            Voir pièces détachées →
          </Link>
        </div>

        {/* KPI strip */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
          <div className="rounded-lg bg-slate-50 px-3 py-2 text-center">
            <p className="text-2xl font-bold text-[#0a2540]">{site.equipements.length}</p>
            <p className="text-xs text-slate-500">Équipements</p>
          </div>
          <div className="rounded-lg bg-emerald-50 px-3 py-2 text-center">
            <p className="text-2xl font-bold text-emerald-700">{fonc}</p>
            <p className="text-xs text-emerald-600">Fonctionnels</p>
          </div>
          <div className="rounded-lg bg-red-50 px-3 py-2 text-center">
            <p className="text-2xl font-bold text-red-700">{panne}</p>
            <p className="text-xs text-red-600">En panne / HS</p>
          </div>
          <div className="rounded-lg bg-gray-100 px-3 py-2 text-center">
            <p className="text-2xl font-bold text-gray-600">{attente}</p>
            <p className="text-xs text-gray-500">En attente</p>
          </div>
          <div className="rounded-lg bg-amber-50 px-3 py-2 text-center">
            <p className="text-xl font-bold text-amber-700">
              {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: 0 }).format(totalCostPieces)}
            </p>
            <p className="text-xs text-amber-600">
              Pièces nécessaires{urgentPiecesCount > 0 ? ` (${urgentPiecesCount} urgentes)` : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Equipment table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-base font-semibold text-[#0a2540]">Équipements du site</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left">Statut</th>
                <th className="px-4 py-3 text-left">Code</th>
                <th className="px-4 py-3 text-left">Désignation</th>
                <th className="px-4 py-3 text-left">Marque / Modèle</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-center">Maint.</th>
                <th className="px-4 py-3 text-center">Pièces</th>
                {isAdmin && <th className="px-4 py-3 text-center">Action</th>}
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {site.equipements.map((eq) => {
                const pieceCost = eq.piecesBesoins.reduce((s, p) => s + (Number(p.prixUnitaire) || 0) * p.quantite, 0);
                return (
                  <tr key={eq.id} className={`transition-colors ${rowBg(eq.statut)}`}>
                    <td className="px-4 py-3">
                      <span className={statusBadge(eq.statut)}>
                        <span className={`h-2 w-2 rounded-full ${statusDot(eq.statut)}`} />
                        {statusLabel(eq.statut)}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{eq.code}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {eq.designation}
                      {eq.observation && (
                        <p className="text-xs text-red-600 mt-0.5 max-w-xs truncate" title={eq.observation}>
                          ⚠ {eq.observation}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {eq.marque} {eq.modele}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{eq.type}</td>
                    <td className="px-4 py-3 text-center tabular-nums">{eq._count.maintenances}</td>
                    <td className="px-4 py-3 text-center">
                      {eq._count.piecesBesoins > 0 ? (
                        <span className="text-xs text-amber-700 font-medium">
                          {eq._count.piecesBesoins}
                          {pieceCost > 0 && (
                            <span className="block text-[10px] text-slate-500">
                              {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: 0 }).format(pieceCost)}
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3 text-center">
                        <EquipmentStatusForm equipId={eq.id} currentStatus={eq.statut} />
                      </td>
                    )}
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/rw/sites/${site.id}/equipements/${eq.id}`}
                        className="text-xs font-medium text-teal-600 hover:text-[#0a2540] transition-colors"
                      >
                        Détails →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
