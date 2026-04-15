import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PsaEquipmentStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { EquipmentStatusForm } from "@/components/psa/equipment-status-form";
import { MaintenanceForm } from "@/components/psa/maintenance-form";
import { PieceForm } from "@/components/psa/piece-form";
import { DeleteMaintenanceButton } from "@/components/psa/delete-maintenance-button";
import { DeletePieceButton } from "@/components/psa/delete-piece-button";

export const dynamic = "force-dynamic";

function statusBadge(s: PsaEquipmentStatus) {
  const base = "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold border";
  switch (s) {
    case "FONCTIONNEL": return `${base} bg-emerald-100 text-emerald-800 border-emerald-300`;
    case "EN_PANNE": return `${base} bg-red-100 text-red-800 border-red-300`;
    case "HORS_SERVICE": return `${base} bg-red-200 text-red-900 border-red-400`;
    case "EN_ATTENTE": return `${base} bg-gray-200 text-gray-700 border-gray-300`;
    default: return `${base} bg-slate-100 text-slate-700 border-slate-300`;
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

function statusDot(s: PsaEquipmentStatus) {
  switch (s) {
    case "FONCTIONNEL": return "bg-emerald-500";
    case "EN_PANNE": return "bg-red-500";
    case "HORS_SERVICE": return "bg-red-700";
    case "EN_ATTENTE": return "bg-gray-400";
    default: return "bg-slate-400";
  }
}

function formatDate(d: Date | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default async function PsaEquipmentDetailPage({
  params,
}: {
  params: Promise<{ siteId: string; equipId: string }>;
}) {
  const { siteId, equipId } = await params;
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === "SUPER_ADMIN" || session?.user?.role === "ADMIN";

  const eq = await prisma.psaEquipment.findUnique({
    where: { id: equipId },
    include: {
      site: true,
      maintenances: { orderBy: { dateMaintenance: "desc" } },
      piecesBesoins: { orderBy: [{ urgence: "desc" }, { designation: "asc" }] },
    },
  });
  if (!eq || eq.siteId !== siteId) notFound();

  const totalCostPieces = eq.piecesBesoins.reduce(
    (s, p) => s + (Number(p.prixUnitaire) || 0) * p.quantite,
    0
  );

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="text-xs text-slate-500">
        <Link href="/rw" className="hover:text-[#0a2540]">Sites PSA</Link>
        <span className="mx-2">/</span>
        <Link href={`/rw/sites/${siteId}`} className="hover:text-[#0a2540]">{eq.site.nom}</Link>
        <span className="mx-2">/</span>
        <span className="font-medium text-slate-700">{eq.designation}</span>
      </nav>

      {/* Equipment header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className={statusBadge(eq.statut)}>
                <span className={`h-2 w-2 rounded-full ${statusDot(eq.statut)}`} />
                {statusLabel(eq.statut)}
              </span>
              {isAdmin && <EquipmentStatusForm equipId={eq.id} currentStatus={eq.statut} />}
            </div>
            <h2 className="text-xl font-bold text-[#0a2540]">{eq.designation}</h2>
            <p className="text-sm text-slate-500 font-mono">{eq.code}</p>
          </div>
        </div>

        {/* Details grid */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 text-sm">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">Marque</p>
            <p className="font-medium text-slate-800">{eq.marque || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">Modèle</p>
            <p className="font-medium text-slate-800">{eq.modele || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">N° série</p>
            <p className="font-mono text-xs text-slate-700">{eq.numeroSerie || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">Type</p>
            <p className="font-medium text-slate-800">{eq.type || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">Mise en service</p>
            <p className="font-medium text-slate-800">{formatDate(eq.dateMiseEnService)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">Fin garantie</p>
            <p className="font-medium text-slate-800">{formatDate(eq.dateFinGarantie)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">Site</p>
            <p className="font-medium text-slate-800">{eq.site.nom}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">Maintenances</p>
            <p className="font-medium text-slate-800">{eq.maintenances.length}</p>
          </div>
        </div>

        {eq.observation && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <span className="font-semibold">Observation :</span> {eq.observation}
          </div>
        )}
      </div>

      {/* Maintenance history */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-semibold text-[#0a2540]">
            Historique de maintenance ({eq.maintenances.length})
          </h3>
        </div>

        {isAdmin && (
          <div className="px-5 py-4 bg-slate-50 border-b border-slate-100">
            <MaintenanceForm equipId={eq.id} siteId={siteId} />
          </div>
        )}

        {eq.maintenances.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-slate-500">Aucune maintenance enregistrée.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {eq.maintenances.map((m) => (
              <div key={m.id} className="px-5 py-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-slate-500">{formatDate(m.dateMaintenance)}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        m.type === "Préventive"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-orange-100 text-orange-800"
                      }`}>
                        {m.type}
                      </span>
                      {m.numeroPV && (
                        <span className="text-xs font-mono text-teal-600">{m.numeroPV}</span>
                      )}
                      {m.technicien && (
                        <span className="text-xs text-slate-500">👤 {m.technicien}</span>
                      )}
                      {m.dureeHeures && (
                        <span className="text-xs text-slate-500">⏱ {String(m.dureeHeures)}h</span>
                      )}
                      {m.coutTotal && (
                        <span className="text-xs font-semibold text-[#0a2540]">
                          {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(Number(m.coutTotal))}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-800">{m.description}</p>
                    {m.resultat && (
                      <p className="text-xs text-slate-600">
                        <span className="font-medium">Résultat :</span> {m.resultat}
                      </p>
                    )}
                    {m.piecesUtilisees && (
                      <p className="text-xs text-slate-500">
                        <span className="font-medium">Pièces :</span> {m.piecesUtilisees}
                      </p>
                    )}
                    {m.kitMaintenance && (
                      <p className="text-xs text-slate-500">
                        <span className="font-medium">Kit :</span> {m.kitMaintenance}
                      </p>
                    )}
                    {m.observations && (
                      <p className="text-xs text-slate-400 italic">{m.observations}</p>
                    )}
                  </div>
                  {isAdmin && (
                    <DeleteMaintenanceButton maintenanceId={m.id} equipId={eq.id} siteId={siteId} />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Spare parts needed */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-semibold text-[#0a2540]">
            Pièces détachées nécessaires ({eq.piecesBesoins.length})
          </h3>
          {totalCostPieces > 0 && (
            <span className="text-sm font-bold text-[#0a2540]">
              Total : {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: 0 }).format(totalCostPieces)}
            </span>
          )}
        </div>

        {isAdmin && (
          <div className="px-5 py-4 bg-slate-50 border-b border-slate-100">
            <PieceForm equipId={eq.id} siteId={siteId} />
          </div>
        )}

        {eq.piecesBesoins.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-slate-500">Aucune pièce détachée enregistrée.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2 text-left">Désignation</th>
                  <th className="px-4 py-2 text-left">Référence</th>
                  <th className="px-4 py-2 text-center">Qté</th>
                  <th className="px-4 py-2 text-right">PU (EUR)</th>
                  <th className="px-4 py-2 text-right">Total</th>
                  <th className="px-4 py-2 text-center">Urgence</th>
                  <th className="px-4 py-2 text-center">Stock</th>
                  <th className="px-4 py-2 text-left">Fournisseur</th>
                  {isAdmin && <th className="px-4 py-2"></th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {eq.piecesBesoins.map((p) => (
                  <tr key={p.id} className={`transition-colors ${p.urgence ? "bg-red-50/30 hover:bg-red-50" : "hover:bg-slate-50"}`}>
                    <td className="px-4 py-2 font-medium text-slate-800">
                      {p.designation}
                      {p.observations && (
                        <p className="text-xs text-slate-400 mt-0.5">{p.observations}</p>
                      )}
                    </td>
                    <td className="px-4 py-2 font-mono text-xs text-slate-600">{p.reference || "—"}</td>
                    <td className="px-4 py-2 text-center tabular-nums">{p.quantite}</td>
                    <td className="px-4 py-2 text-right tabular-nums">
                      {p.prixUnitaire ? new Intl.NumberFormat("fr-FR").format(Number(p.prixUnitaire)) : "—"}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums font-semibold">
                      {p.prixUnitaire
                        ? new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(Number(p.prixUnitaire) * p.quantite)
                        : "—"}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {p.urgence ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
                          URGENT
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {p.enStock ? (
                        <span className="text-emerald-600 text-xs font-medium">Oui</span>
                      ) : p.commandee ? (
                        <span className="text-amber-600 text-xs font-medium">Commandée</span>
                      ) : (
                        <span className="text-red-500 text-xs font-medium">Non</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-xs text-slate-500">{p.fournisseur || "—"}</td>
                    {isAdmin && (
                      <td className="px-4 py-2 text-right">
                        <DeletePieceButton pieceId={p.id} equipId={eq.id} siteId={siteId} />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
