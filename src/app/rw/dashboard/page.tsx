import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PsaEquipmentStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

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

function statusBadge(s: PsaEquipmentStatus) {
  const base = "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold";
  switch (s) {
    case "FONCTIONNEL": return `${base} bg-emerald-100 text-emerald-800`;
    case "EN_PANNE": return `${base} bg-red-100 text-red-800`;
    case "HORS_SERVICE": return `${base} bg-red-200 text-red-900`;
    case "EN_ATTENTE": return `${base} bg-gray-200 text-gray-700`;
    default: return `${base} bg-slate-100 text-slate-700`;
  }
}

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: 0 }).format(n);

export default async function PsaDashboardPage() {
  const sites = await prisma.psaSite.findMany({
    orderBy: { code: "asc" },
    include: {
      equipements: {
        include: {
          maintenances: { orderBy: { dateMaintenance: "desc" } },
          piecesBesoins: true,
        },
      },
    },
  });

  const allEquip = sites.flatMap((s) => s.equipements);
  const allMaint = allEquip.flatMap((e) => e.maintenances);
  const allPieces = allEquip.flatMap((e) => e.piecesBesoins);

  const totalEquip = allEquip.length;
  const totalFonc = allEquip.filter((e) => e.statut === "FONCTIONNEL").length;
  const totalPanne = allEquip.filter((e) => e.statut === "EN_PANNE" || e.statut === "HORS_SERVICE").length;
  const totalAttente = allEquip.filter((e) => e.statut === "EN_ATTENTE").length;

  const totalMaint = allMaint.length;
  const totalPrev = allMaint.filter((m) => m.type === "Préventive").length;
  const totalCorr = allMaint.filter((m) => m.type === "Corrective").length;
  const totalCoutMaint = allMaint.reduce((s, m) => s + (Number(m.coutTotal) || 0), 0);

  const totalPiecesCount = allPieces.length;
  const totalPiecesCost = allPieces.reduce((s, p) => s + (Number(p.prixUnitaire) || 0) * p.quantite, 0);
  const urgentPieces = allPieces.filter((p) => p.urgence);
  const urgentCost = urgentPieces.reduce((s, p) => s + (Number(p.prixUnitaire) || 0) * p.quantite, 0);
  const enStockCount = allPieces.filter((p) => p.enStock).length;
  const commandeesCount = allPieces.filter((p) => p.commandee && !p.enStock).length;
  const aCommanderCount = allPieces.filter((p) => !p.enStock && !p.commandee).length;

  const tauxDisponibilite = totalEquip > 0 ? Math.round((totalFonc / totalEquip) * 100) : 0;

  const panneEquipments = allEquip
    .filter((e) => e.statut === "EN_PANNE" || e.statut === "HORS_SERVICE")
    .map((e) => ({
      ...e,
      siteName: sites.find((s) => s.id === e.siteId)?.nom || "",
      siteCode: sites.find((s) => s.id === e.siteId)?.code || "",
    }));

  const recentMaint = allMaint
    .slice(0, 10)
    .map((m) => {
      const eq = allEquip.find((e) => e.id === m.equipementId);
      const site = sites.find((s) => s.id === eq?.siteId);
      return { ...m, equipName: eq?.designation || "", siteCode: site?.code || "" };
    });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-[#0a2540]">Dashboard — Bilan consolidé PSA Rwanda</h2>
        <p className="text-sm text-slate-500 mt-1">Synthèse automatique des 3 sites audités</p>
      </div>

      {totalEquip === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">
          Aucune donnée. Veuillez d&apos;abord injecter les données depuis la page d&apos;accueil.
        </div>
      )}

      {totalEquip > 0 && (
        <>
          {/* Top KPIs */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm text-center">
              <p className="text-3xl font-bold text-[#0a2540]">{sites.length}</p>
              <p className="text-xs text-slate-500 mt-1">Sites</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm text-center">
              <p className="text-3xl font-bold text-[#0a2540]">{totalEquip}</p>
              <p className="text-xs text-slate-500 mt-1">Équipements</p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm text-center">
              <p className="text-3xl font-bold text-emerald-700">{tauxDisponibilite}%</p>
              <p className="text-xs text-emerald-600 mt-1">Taux disponibilité</p>
            </div>
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm text-center">
              <p className="text-3xl font-bold text-red-700">{totalPanne}</p>
              <p className="text-xs text-red-600 mt-1">En panne / HS</p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm text-center">
              <p className="text-2xl font-bold text-amber-700">{fmt(totalPiecesCost)}</p>
              <p className="text-xs text-amber-600 mt-1">Pièces nécessaires</p>
            </div>
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 shadow-sm text-center">
              <p className="text-2xl font-bold text-blue-700">{fmt(totalCoutMaint)}</p>
              <p className="text-xs text-blue-600 mt-1">Coûts maintenance</p>
            </div>
          </div>

          {/* Site comparison */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="text-base font-semibold text-[#0a2540]">Comparaison par site</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left">Site</th>
                    <th className="px-4 py-3 text-left">Capacité O₂</th>
                    <th className="px-4 py-3 text-center">Équipements</th>
                    <th className="px-4 py-3 text-center">Fonctionnels</th>
                    <th className="px-4 py-3 text-center">En panne</th>
                    <th className="px-4 py-3 text-center">Attente</th>
                    <th className="px-4 py-3 text-center">Disponibilité</th>
                    <th className="px-4 py-3 text-center">Maintenances</th>
                    <th className="px-4 py-3 text-right">Coût pièces</th>
                    <th className="px-4 py-3 text-right">Pièces urgentes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sites.map((site) => {
                    const eqs = site.equipements;
                    const sFonc = eqs.filter((e) => e.statut === "FONCTIONNEL").length;
                    const sPanne = eqs.filter((e) => e.statut === "EN_PANNE" || e.statut === "HORS_SERVICE").length;
                    const sAtt = eqs.filter((e) => e.statut === "EN_ATTENTE").length;
                    const sDispo = eqs.length > 0 ? Math.round((sFonc / eqs.length) * 100) : 0;
                    const sMaint = eqs.flatMap((e) => e.maintenances).length;
                    const sP = eqs.flatMap((e) => e.piecesBesoins);
                    const sCost = sP.reduce((s, p) => s + (Number(p.prixUnitaire) || 0) * p.quantite, 0);
                    const sUrgent = sP.filter((p) => p.urgence).length;

                    return (
                      <tr key={site.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <Link href={`/rw/sites/${site.id}`} className="font-medium text-teal-600 hover:text-[#0a2540]">
                            {site.nom}
                          </Link>
                          <p className="text-xs text-slate-400 font-mono">{site.code}</p>
                        </td>
                        <td className="px-4 py-3 text-xs text-teal-600 font-medium">{site.capaciteO2 || "—"}</td>
                        <td className="px-4 py-3 text-center tabular-nums font-medium">{eqs.length}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" /> {sFonc}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {sPanne > 0 ? (
                            <span className="inline-flex items-center gap-1 text-red-700 font-semibold">
                              <span className="h-2 w-2 rounded-full bg-red-500" /> {sPanne}
                            </span>
                          ) : (
                            <span className="text-slate-300">0</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {sAtt > 0 ? (
                            <span className="inline-flex items-center gap-1 text-gray-600 font-semibold">
                              <span className="h-2 w-2 rounded-full bg-gray-400" /> {sAtt}
                            </span>
                          ) : (
                            <span className="text-slate-300">0</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`font-bold ${sDispo >= 80 ? "text-emerald-700" : sDispo >= 50 ? "text-amber-700" : "text-red-700"}`}>
                            {sDispo}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center tabular-nums">{sMaint}</td>
                        <td className="px-4 py-3 text-right font-semibold text-[#0a2540] tabular-nums">
                          {sCost > 0 ? fmt(sCost) : "—"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {sUrgent > 0 ? (
                            <span className="text-red-700 font-semibold">{sUrgent}</span>
                          ) : (
                            <span className="text-slate-300">0</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-50 border-t-2 border-slate-200 text-xs font-bold uppercase text-slate-600">
                  <tr>
                    <td className="px-4 py-3">TOTAL</td>
                    <td className="px-4 py-3"></td>
                    <td className="px-4 py-3 text-center">{totalEquip}</td>
                    <td className="px-4 py-3 text-center text-emerald-700">{totalFonc}</td>
                    <td className="px-4 py-3 text-center text-red-700">{totalPanne}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{totalAttente}</td>
                    <td className="px-4 py-3 text-center font-bold">{tauxDisponibilite}%</td>
                    <td className="px-4 py-3 text-center">{totalMaint}</td>
                    <td className="px-4 py-3 text-right text-[#0a2540] text-sm">{fmt(totalPiecesCost)}</td>
                    <td className="px-4 py-3 text-right text-red-700">{urgentPieces.length}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Maintenance summary */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Maintenance stats */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="text-base font-semibold text-[#0a2540]">Résumé maintenances</h3>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg bg-blue-50 px-3 py-3 text-center">
                    <p className="text-2xl font-bold text-blue-700">{totalPrev}</p>
                    <p className="text-xs text-blue-600">Préventives</p>
                  </div>
                  <div className="rounded-lg bg-orange-50 px-3 py-3 text-center">
                    <p className="text-2xl font-bold text-orange-700">{totalCorr}</p>
                    <p className="text-xs text-orange-600">Correctives</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 px-3 py-3 text-center">
                    <p className="text-2xl font-bold text-slate-700">{fmt(totalCoutMaint)}</p>
                    <p className="text-xs text-slate-500">Coût total</p>
                  </div>
                </div>

                <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mt-4">Dernières interventions</h4>
                <div className="space-y-2">
                  {recentMaint.map((m) => (
                    <div key={m.id} className="flex items-center gap-3 text-xs">
                      <span className="text-slate-400 font-mono w-20 flex-shrink-0">
                        {new Date(m.dateMaintenance).toLocaleDateString("fr-FR")}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 font-semibold ${
                        m.type === "Préventive" ? "bg-blue-100 text-blue-800" : "bg-orange-100 text-orange-800"
                      }`}>
                        {m.type}
                      </span>
                      <span className="text-slate-600 truncate flex-1">{m.equipName}</span>
                      <span className="text-slate-400 font-mono">{m.siteCode}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Spare parts summary */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="text-base font-semibold text-[#0a2540]">Résumé pièces détachées</h3>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-lg bg-slate-50 px-3 py-3 text-center">
                    <p className="text-2xl font-bold text-slate-700">{totalPiecesCount}</p>
                    <p className="text-xs text-slate-500">Total lignes</p>
                  </div>
                  <div className="rounded-lg bg-red-50 px-3 py-3 text-center">
                    <p className="text-2xl font-bold text-red-700">{aCommanderCount}</p>
                    <p className="text-xs text-red-600">À commander</p>
                  </div>
                  <div className="rounded-lg bg-amber-50 px-3 py-3 text-center">
                    <p className="text-2xl font-bold text-amber-700">{commandeesCount}</p>
                    <p className="text-xs text-amber-600">Commandées</p>
                  </div>
                  <div className="rounded-lg bg-emerald-50 px-3 py-3 text-center">
                    <p className="text-2xl font-bold text-emerald-700">{enStockCount}</p>
                    <p className="text-xs text-emerald-600">En stock</p>
                  </div>
                </div>

                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-amber-800">Budget total pièces détachées</span>
                    <span className="text-xl font-bold text-amber-900">{fmt(totalPiecesCost)}</span>
                  </div>
                  {urgentCost > 0 && (
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-red-700">dont urgentes ({urgentPieces.length})</span>
                      <span className="text-sm font-bold text-red-700">{fmt(urgentCost)}</span>
                    </div>
                  )}
                </div>

                <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mt-4">Équipements en panne</h4>
                <div className="space-y-2">
                  {panneEquipments.length === 0 ? (
                    <p className="text-xs text-slate-400">Aucun équipement en panne.</p>
                  ) : (
                    panneEquipments.map((e) => (
                      <div key={e.id} className="flex items-start gap-2 text-xs rounded-lg border border-red-100 bg-red-50/50 px-3 py-2">
                        <span className={`mt-0.5 h-2 w-2 rounded-full flex-shrink-0 ${statusDot(e.statut)}`} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-red-800">{e.designation}</span>
                            <span className={statusBadge(e.statut)}>{statusLabel(e.statut)}</span>
                          </div>
                          <p className="text-red-600 mt-0.5">{e.siteCode} — {e.siteName}</p>
                          {e.observation && (
                            <p className="text-slate-500 mt-0.5">{e.observation}</p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
