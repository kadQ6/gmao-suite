import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import {
  PsaActionPriority,
  PsaActionStatus,
  PsaEquipmentStatus,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

const fmtEur = (n: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);

const fmtDate = (d: Date) =>
  d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

function dec(n: { toString(): string } | null | undefined): number {
  if (n == null) return 0;
  const v = Number(n);
  return Number.isFinite(v) ? v : 0;
}

function pieceLineCost(p: { prixUnitaire: unknown; quantite: number }): number {
  return dec(p.prixUnitaire as never) * p.quantite;
}

/** Seed + forms use "Préventive" / "Corrective"; accept common variants. */
function isPreventiveType(type: string): boolean {
  const t = type.trim().toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
  return t === "preventive" || t === "preventif" || t === "préventive" || t === "préventif";
}

function isCurativeType(type: string): boolean {
  const t = type.trim().toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
  return t === "corrective" || t === "curative" || t === "curatif";
}

function statusLabel(s: PsaEquipmentStatus) {
  switch (s) {
    case "FONCTIONNEL":
      return "Fonctionnel";
    case "EN_PANNE":
      return "En panne";
    case "EN_ATTENTE":
      return "En attente";
    case "HORS_SERVICE":
      return "Hors service";
    default:
      return s;
  }
}

function statusDot(s: PsaEquipmentStatus) {
  switch (s) {
    case "FONCTIONNEL":
      return "bg-emerald-500";
    case "EN_PANNE":
      return "bg-red-500";
    case "HORS_SERVICE":
      return "bg-red-700";
    case "EN_ATTENTE":
      return "bg-gray-400";
    default:
      return "bg-slate-400";
  }
}

function statusBadge(s: PsaEquipmentStatus) {
  const base = "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold";
  switch (s) {
    case "FONCTIONNEL":
      return `${base} bg-emerald-100 text-emerald-800`;
    case "EN_PANNE":
      return `${base} bg-red-100 text-red-800`;
    case "HORS_SERVICE":
      return `${base} bg-red-200 text-red-900`;
    case "EN_ATTENTE":
      return `${base} bg-gray-200 text-gray-700`;
    default:
      return `${base} bg-slate-100 text-slate-700`;
  }
}

function actionStatusLabel(s: PsaActionStatus) {
  switch (s) {
    case "A_FAIRE":
      return "À faire";
    case "EN_COURS":
      return "En cours";
    case "TERMINE":
      return "Terminé";
    case "ANNULE":
      return "Annulé";
    default:
      return s;
  }
}

export default async function PsaDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/rw/login");

  const sites = await prisma.psaSite.findMany({
    orderBy: { code: "asc" },
    include: {
      equipements: {
        include: {
          maintenances: { orderBy: { dateMaintenance: "desc" } },
          piecesBesoins: true,
          actions: true,
        },
      },
    },
  });

  const allEquip = sites.flatMap((s) => s.equipements);
  const allMaint = allEquip.flatMap((e) => e.maintenances);
  const allPieces = allEquip.flatMap((e) => e.piecesBesoins);
  const allActions = allEquip.flatMap((e) => e.actions);

  const totalEquip = allEquip.length;
  const totalFonc = allEquip.filter((e) => e.statut === PsaEquipmentStatus.FONCTIONNEL).length;
  const totalPanne = allEquip.filter(
    (e) => e.statut === PsaEquipmentStatus.EN_PANNE || e.statut === PsaEquipmentStatus.HORS_SERVICE,
  ).length;
  const totalAttente = allEquip.filter((e) => e.statut === PsaEquipmentStatus.EN_ATTENTE).length;

  const totalMaint = allMaint.length;
  const totalPrev = allMaint.filter((m) => isPreventiveType(m.type)).length;
  const totalCorr = allMaint.filter((m) => isCurativeType(m.type)).length;
  const totalCoutMaint = allMaint.reduce((s, m) => s + dec(m.coutTotal), 0);
  const coutPrev = allMaint.filter((m) => isPreventiveType(m.type)).reduce((s, m) => s + dec(m.coutTotal), 0);
  const coutCorr = allMaint.filter((m) => isCurativeType(m.type)).reduce((s, m) => s + dec(m.coutTotal), 0);

  const totalPiecesCount = allPieces.length;
  const totalPiecesCost = allPieces.reduce((s, p) => s + pieceLineCost(p), 0);
  const urgentPieces = allPieces.filter((p) => p.urgence);
  const urgentCost = urgentPieces.reduce((s, p) => s + pieceLineCost(p), 0);
  const enStockCount = allPieces.filter((p) => p.enStock).length;
  const commandeesCount = allPieces.filter((p) => p.commandee && !p.enStock).length;
  const aCommanderCount = allPieces.filter((p) => !p.enStock && !p.commandee).length;

  const tauxDisponibilite = totalEquip > 0 ? Math.round((totalFonc / totalEquip) * 100) : 0;

  const panneEquipments = allEquip
    .filter(
      (e) => e.statut === PsaEquipmentStatus.EN_PANNE || e.statut === PsaEquipmentStatus.HORS_SERVICE,
    )
    .map((e) => ({
      ...e,
      siteName: sites.find((s) => s.id === e.siteId)?.nom || "",
      siteCode: sites.find((s) => s.id === e.siteId)?.code || "",
    }));

  const recentMaint = [...allMaint]
    .sort((a, b) => new Date(b.dateMaintenance).getTime() - new Date(a.dateMaintenance).getTime())
    .slice(0, 10)
    .map((m) => {
      const eq = allEquip.find((e) => e.id === m.equipementId);
      const site = sites.find((s) => s.id === eq?.siteId);
      return { ...m, equipName: eq?.designation || "", siteCode: site?.code || "" };
    });

  const actionsAFaire = allActions.filter((a) => a.statut === PsaActionStatus.A_FAIRE).length;
  const actionsEnCours = allActions.filter((a) => a.statut === PsaActionStatus.EN_COURS).length;
  const actionsTermine = allActions.filter((a) => a.statut === PsaActionStatus.TERMINE).length;

  const critiqueActions = allActions
    .filter((a) => a.priorite === PsaActionPriority.CRITIQUE)
    .map((a) => {
      const eq = allEquip.find((e) => e.id === a.equipementId);
      const site = sites.find((s) => s.id === eq?.siteId);
      return {
        id: a.id,
        designation: a.designation,
        statut: a.statut,
        equipementName: eq?.designation ?? "—",
        siteId: site?.id ?? "",
        siteNom: site?.nom ?? "—",
        siteCode: site?.code ?? "",
      };
    })
    .sort((a, b) => a.siteNom.localeCompare(b.siteNom, "fr"));

  type SiteCostRow = {
    siteId: string;
    siteNom: string;
    siteCode: string;
    maintPrev: number;
    maintCur: number;
    maintTotal: number;
    remediation: number;
    pieces: number;
    totalInvest: number;
  };

  const siteCostRows: SiteCostRow[] = sites.map((site) => {
    const eqs = site.equipements;
    const mains = eqs.flatMap((e) => e.maintenances);
    const acts = eqs.flatMap((e) => e.actions);
    const pieces = eqs.flatMap((e) => e.piecesBesoins);

    const maintPrev = mains.filter((m) => isPreventiveType(m.type)).reduce((s, m) => s + dec(m.coutTotal), 0);
    const maintCur = mains.filter((m) => isCurativeType(m.type)).reduce((s, m) => s + dec(m.coutTotal), 0);
    const maintTotal = mains.reduce((s, m) => s + dec(m.coutTotal), 0);
    const remediation = acts
      .filter((a) => a.statut !== PsaActionStatus.TERMINE)
      .reduce((s, a) => s + dec(a.coutEstime), 0);
    const piecesCost = pieces.reduce((s, p) => s + pieceLineCost(p), 0);
    const totalInvest = maintTotal + remediation + piecesCost;

    return {
      siteId: site.id,
      siteNom: site.nom,
      siteCode: site.code,
      maintPrev,
      maintCur,
      maintTotal,
      remediation,
      pieces: piecesCost,
      totalInvest,
    };
  });

  const grandCostTotals = siteCostRows.reduce(
    (acc, r) => ({
      maintPrev: acc.maintPrev + r.maintPrev,
      maintCur: acc.maintCur + r.maintCur,
      maintTotal: acc.maintTotal + r.maintTotal,
      remediation: acc.remediation + r.remediation,
      pieces: acc.pieces + r.pieces,
      totalInvest: acc.totalInvest + r.totalInvest,
    }),
    { maintPrev: 0, maintCur: 0, maintTotal: 0, remediation: 0, pieces: 0, totalInvest: 0 },
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-[#0a2540]">Dashboard — Bilan consolidé PSA Rwanda</h2>
        <p className="text-sm text-slate-500 mt-1">Synthèse des sites, coûts et actions</p>
      </div>

      {totalEquip === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">
          Aucune donnée. Veuillez d&apos;abord injecter les données depuis la page d&apos;accueil.
        </div>
      )}

      {totalEquip > 0 && (
        <>
          {/* 1. Top KPIs */}
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
              <p className="text-xs text-teal-600 mt-1">Disponibilité (% fonctionnel)</p>
            </div>
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm text-center">
              <p className="text-3xl font-bold text-red-700">{totalPanne}</p>
              <p className="text-xs text-red-600 mt-1">En panne / HS</p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm text-center">
              <p className="text-2xl font-bold text-amber-700">{fmtEur(totalPiecesCost)}</p>
              <p className="text-xs text-amber-600 mt-1">Coût pièces (EUR)</p>
            </div>
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 shadow-sm text-center">
              <p className="text-2xl font-bold text-blue-700">{fmtEur(totalCoutMaint)}</p>
              <p className="text-xs text-blue-600 mt-1">Coûts maintenance (EUR)</p>
            </div>
          </div>

          {/* 2. Cost comparison */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="text-base font-semibold text-[#0a2540]">Comparaison des coûts par site</h3>
              <p className="text-xs text-slate-500 mt-1">
                Maintenance réalisée, remise en état (actions non terminées), besoins pièces — total à investir.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left">Site</th>
                    <th className="px-4 py-3 text-right">Maint. préventive</th>
                    <th className="px-4 py-3 text-right">Maint. curative</th>
                    <th className="px-4 py-3 text-right">Total maint.</th>
                    <th className="px-4 py-3 text-right">Remise en état</th>
                    <th className="px-4 py-3 text-right">Pièces</th>
                    <th className="px-4 py-3 text-right">Total à investir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {siteCostRows.map((row) => (
                    <tr key={row.siteId} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <Link href={`/rw/sites/${row.siteId}`} className="font-medium text-teal-600 hover:text-[#0a2540]">
                          {row.siteNom}
                        </Link>
                        <p className="text-xs text-slate-400 font-mono">{row.siteCode}</p>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-[#0a2540]">{fmtEur(row.maintPrev)}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-[#0a2540]">{fmtEur(row.maintCur)}</td>
                      <td className="px-4 py-3 text-right tabular-nums font-medium text-[#0a2540]">{fmtEur(row.maintTotal)}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-orange-700">{fmtEur(row.remediation)}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-amber-800">{fmtEur(row.pieces)}</td>
                      <td className="px-4 py-3 text-right tabular-nums font-bold text-teal-600">{fmtEur(row.totalInvest)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-100 border-t-2 border-slate-300 text-xs font-bold uppercase text-[#0a2540]">
                  <tr>
                    <td className="px-4 py-3">Total général</td>
                    <td className="px-4 py-3 text-right tabular-nums normal-case">{fmtEur(grandCostTotals.maintPrev)}</td>
                    <td className="px-4 py-3 text-right tabular-nums normal-case">{fmtEur(grandCostTotals.maintCur)}</td>
                    <td className="px-4 py-3 text-right tabular-nums normal-case">{fmtEur(grandCostTotals.maintTotal)}</td>
                    <td className="px-4 py-3 text-right tabular-nums normal-case text-orange-800">
                      {fmtEur(grandCostTotals.remediation)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums normal-case">{fmtEur(grandCostTotals.pieces)}</td>
                    <td className="px-4 py-3 text-right tabular-nums normal-case text-teal-600">
                      {fmtEur(grandCostTotals.totalInvest)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* 3. Site comparison */}
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
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sites.map((site) => {
                    const eqs = site.equipements;
                    const sFonc = eqs.filter((e) => e.statut === PsaEquipmentStatus.FONCTIONNEL).length;
                    const sPanne = eqs.filter(
                      (e) =>
                        e.statut === PsaEquipmentStatus.EN_PANNE || e.statut === PsaEquipmentStatus.HORS_SERVICE,
                    ).length;
                    const sAtt = eqs.filter((e) => e.statut === PsaEquipmentStatus.EN_ATTENTE).length;
                    const sDispo = eqs.length > 0 ? Math.round((sFonc / eqs.length) * 100) : 0;
                    const sMaint = eqs.flatMap((e) => e.maintenances).length;
                    const sP = eqs.flatMap((e) => e.piecesBesoins);
                    const sCost = sP.reduce((s, p) => s + pieceLineCost(p), 0);
                    const sUrgent = sP.filter((p) => p.urgence).length;
                    const sActions = eqs.flatMap((e) => e.actions).length;

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
                          <span
                            className={`font-bold ${
                              sDispo >= 80 ? "text-emerald-700" : sDispo >= 50 ? "text-amber-700" : "text-red-700"
                            }`}
                          >
                            {sDispo}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center tabular-nums">{sMaint}</td>
                        <td className="px-4 py-3 text-right font-semibold text-[#0a2540] tabular-nums">
                          {sCost > 0 ? fmtEur(sCost) : "—"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {sUrgent > 0 ? (
                            <span className="text-red-700 font-semibold">{sUrgent}</span>
                          ) : (
                            <span className="text-slate-300">0</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center tabular-nums font-medium text-[#0a2540]">{sActions}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-50 border-t-2 border-slate-200 text-xs font-bold uppercase text-slate-600">
                  <tr>
                    <td className="px-4 py-3">TOTAL</td>
                    <td className="px-4 py-3" />
                    <td className="px-4 py-3 text-center">{totalEquip}</td>
                    <td className="px-4 py-3 text-center text-emerald-700">{totalFonc}</td>
                    <td className="px-4 py-3 text-center text-red-700">{totalPanne}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{totalAttente}</td>
                    <td className="px-4 py-3 text-center font-bold">{tauxDisponibilite}%</td>
                    <td className="px-4 py-3 text-center">{totalMaint}</td>
                    <td className="px-4 py-3 text-right text-[#0a2540] text-sm">{fmtEur(totalPiecesCost)}</td>
                    <td className="px-4 py-3 text-right text-red-700">{urgentPieces.length}</td>
                    <td className="px-4 py-3 text-center text-[#0a2540]">{allActions.length}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* 4. Actions summary */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="text-base font-semibold text-[#0a2540]">Résumé des actions</h3>
            </div>
            <div className="p-5 space-y-6">
              <div className="grid grid-cols-3 gap-3 max-w-xl">
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-center">
                  <p className="text-2xl font-bold text-[#0a2540]">{actionsAFaire}</p>
                  <p className="text-xs text-slate-600 mt-1">À faire</p>
                </div>
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-center">
                  <p className="text-2xl font-bold text-amber-800">{actionsEnCours}</p>
                  <p className="text-xs text-amber-700 mt-1">En cours</p>
                </div>
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-3 text-center">
                  <p className="text-2xl font-bold text-emerald-800">{actionsTermine}</p>
                  <p className="text-xs text-emerald-700 mt-1">Terminé</p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Par site</h4>
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-50 text-xs font-semibold text-slate-500">
                      <tr>
                        <th className="px-3 py-2 text-left">Site</th>
                        <th className="px-3 py-2 text-center">À faire</th>
                        <th className="px-3 py-2 text-center">En cours</th>
                        <th className="px-3 py-2 text-center">Terminé</th>
                        <th className="px-3 py-2 text-center">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sites.map((site) => {
                        const acts = site.equipements.flatMap((e) => e.actions);
                        const af = acts.filter((a) => a.statut === PsaActionStatus.A_FAIRE).length;
                        const ec = acts.filter((a) => a.statut === PsaActionStatus.EN_COURS).length;
                        const te = acts.filter((a) => a.statut === PsaActionStatus.TERMINE).length;
                        return (
                          <tr key={site.id}>
                            <td className="px-3 py-2">
                              <Link href={`/rw/sites/${site.id}`} className="text-teal-600 hover:text-[#0a2540] font-medium">
                                {site.nom}
                              </Link>
                            </td>
                            <td className="px-3 py-2 text-center tabular-nums">{af}</td>
                            <td className="px-3 py-2 text-center tabular-nums">{ec}</td>
                            <td className="px-3 py-2 text-center tabular-nums">{te}</td>
                            <td className="px-3 py-2 text-center tabular-nums font-medium">{acts.length}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                  Actions critiques
                </h4>
                {critiqueActions.length === 0 ? (
                  <p className="text-sm text-slate-400">Aucune action priorité critique.</p>
                ) : (
                  <ul className="space-y-2">
                    {critiqueActions.map((a) => (
                      <li
                        key={a.id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 rounded-lg border border-red-100 bg-red-50/50 px-3 py-2 text-sm"
                      >
                        <div>
                          <span className="font-semibold text-[#0a2540]">{a.designation}</span>
                          <p className="text-xs text-slate-600 mt-0.5">
                            <span className="font-medium">{a.equipementName}</span>
                            {" · "}
                            {a.siteId ? (
                              <Link href={`/rw/sites/${a.siteId}`} className="text-teal-600 hover:text-[#0a2540]">
                                {a.siteNom}
                              </Link>
                            ) : (
                              a.siteNom
                            )}
                            <span className="text-slate-400 font-mono ml-1">{a.siteCode}</span>
                          </p>
                        </div>
                        <span className="text-xs font-semibold text-red-800 shrink-0">{actionStatusLabel(a.statut)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* 5. Maintenance + 6. Spare parts */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="text-base font-semibold text-[#0a2540]">Résumé maintenances</h3>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-lg bg-blue-50 px-3 py-3 text-center">
                    <p className="text-2xl font-bold text-blue-700">{totalPrev}</p>
                    <p className="text-xs text-blue-600">Préventives</p>
                    <p className="text-xs font-semibold text-[#0a2540] mt-1">{fmtEur(coutPrev)}</p>
                  </div>
                  <div className="rounded-lg bg-orange-50 px-3 py-3 text-center">
                    <p className="text-2xl font-bold text-orange-700">{totalCorr}</p>
                    <p className="text-xs text-orange-600">Correctives</p>
                    <p className="text-xs font-semibold text-[#0a2540] mt-1">{fmtEur(coutCorr)}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 px-3 py-3 text-center sm:col-span-2">
                    <p className="text-2xl font-bold text-slate-700">{fmtEur(totalCoutMaint)}</p>
                    <p className="text-xs text-slate-500">Coût total (tous types)</p>
                  </div>
                </div>

                <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mt-4">
                  10 dernières interventions
                </h4>
                <div className="space-y-2">
                  {recentMaint.map((m) => (
                    <div key={m.id} className="flex items-center gap-3 text-xs">
                      <span className="text-slate-500 font-mono w-24 flex-shrink-0">{fmtDate(new Date(m.dateMaintenance))}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 font-semibold ${
                          isPreventiveType(m.type)
                            ? "bg-blue-100 text-blue-800"
                            : isCurativeType(m.type)
                              ? "bg-orange-100 text-orange-800"
                              : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {m.type}
                      </span>
                      <span className="text-slate-600 truncate flex-1">{m.equipName}</span>
                      <span className="text-slate-400 font-mono">{m.siteCode}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

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
                    <span className="text-sm font-medium text-amber-800">Budget total pièces</span>
                    <span className="text-xl font-bold text-amber-900">{fmtEur(totalPiecesCost)}</span>
                  </div>
                  {urgentCost > 0 && (
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-red-700">dont urgentes ({urgentPieces.length})</span>
                      <span className="text-sm font-bold text-red-700">{fmtEur(urgentCost)}</span>
                    </div>
                  )}
                </div>

                <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mt-4">Équipements en panne / HS</h4>
                <div className="space-y-2">
                  {panneEquipments.length === 0 ? (
                    <p className="text-xs text-slate-400">Aucun équipement en panne ou hors service.</p>
                  ) : (
                    panneEquipments.map((e) => (
                      <div
                        key={e.id}
                        className="flex items-start gap-2 text-xs rounded-lg border border-red-100 bg-red-50/50 px-3 py-2"
                      >
                        <span className={`mt-0.5 h-2 w-2 rounded-full flex-shrink-0 ${statusDot(e.statut)}`} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-red-800">{e.designation}</span>
                            <span className={statusBadge(e.statut)}>{statusLabel(e.statut)}</span>
                          </div>
                          <p className="text-red-600 mt-0.5">
                            {e.siteId ? (
                              <Link href={`/rw/sites/${e.siteId}`} className="text-teal-600 hover:text-[#0a2540]">
                                {e.siteCode} — {e.siteName}
                              </Link>
                            ) : (
                              <>
                                {e.siteCode} — {e.siteName}
                              </>
                            )}
                          </p>
                          {e.observation && <p className="text-slate-500 mt-0.5">{e.observation}</p>}
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
