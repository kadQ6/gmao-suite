import {
  BiomedDiStatus,
  BiomedEquipmentStatus,
  BiomedPmStatus,
  BiomedCqStatus,
} from "@prisma/client";
import { endOfMonth, startOfMonth, subMonths } from "date-fns";
import { prisma } from "@/lib/prisma";
import { getBiomedAlertes, type BiomedAlerte } from "./alertes";

export type BiomedDashboardPayload = {
  equipements: { total: number; actifs: number; enPanne: number; enMaintenance: number };
  interventions: { ouvertes: number; mois: number };
  preventif: { enRetard: number; aVenir: number; tauxRealisation: number };
  controleQualite: { aVenir: number };
  stock: { critique: number };
  indicateurs: { tauxDisponibilite: number; tauxMP: number };
  top5Pannes: Array<{ designation: string; marque: string | null; modele: string | null; count: number }>;
  coutParSite: Array<{ siteCode: string; siteNom: string; coutTotal: number }>;
  alertes: BiomedAlerte[];
  evolutionDI: Array<{ mois: string; count: number }>;
};

function equipWhere(siteId: string | undefined) {
  return { actif: true, ...(siteId ? { siteId } : {}) };
}

export async function getBiomedDashboardData(siteId?: string | null): Promise<BiomedDashboardPayload> {
  const sid = siteId ?? undefined;
  const eq = equipWhere(sid);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const in30 = new Date(today);
  in30.setDate(in30.getDate() + 30);
  const monthStart = startOfMonth(new Date());
  const monthEnd = endOfMonth(new Date());

  const totalEquipements = await prisma.biomedEquipment.count({ where: eq });
  const actifs = await prisma.biomedEquipment.count({
    where: { ...eq, statut: BiomedEquipmentStatus.EN_SERVICE },
  });
  const enPanne = await prisma.biomedEquipment.count({
    where: { ...eq, statut: BiomedEquipmentStatus.EN_PANNE },
  });
  const enMaintenance = await prisma.biomedEquipment.count({
    where: { ...eq, statut: BiomedEquipmentStatus.EN_MAINTENANCE },
  });

  const diOuvertes = await prisma.biomedInterventionRequest.count({
    where: {
      ...(sid ? { siteId: sid } : {}),
      statut: {
        in: [BiomedDiStatus.OUVERTE, BiomedDiStatus.AFFECTEE, BiomedDiStatus.EN_COURS],
      },
    },
  });
  const diMois = await prisma.biomedInterventionRequest.count({
    where: {
      ...(sid ? { siteId: sid } : {}),
      dateCreation: { gte: monthStart, lte: monthEnd },
    },
  });

  const mpRetard = await prisma.biomedPreventiveMaintenance.count({
    where: { statut: BiomedPmStatus.EN_RETARD, equipement: eq },
  });
  const mpAVenir = await prisma.biomedPreventiveMaintenance.count({
    where: {
      statut: BiomedPmStatus.PLANIFIEE,
      datePrevue: { gte: today, lte: in30 },
      equipement: eq,
    },
  });
  const mpRealiseesMois = await prisma.biomedPreventiveMaintenance.count({
    where: {
      statut: BiomedPmStatus.REALISEE,
      dateRealisee: { gte: monthStart, lte: monthEnd },
      equipement: eq,
    },
  });
  const mpPlanifieesMois = await prisma.biomedPreventiveMaintenance.count({
    where: {
      datePrevue: { gte: monthStart, lte: monthEnd },
      equipement: eq,
    },
  });

  const cqAVenir = await prisma.biomedQualityControl.count({
    where: {
      statut: BiomedCqStatus.PLANIFIE,
      datePrevue: { gte: today, lte: in30 },
      equipement: eq,
    },
  });

  const pieces = await prisma.biomedSparePart.findMany({
    where: { actif: true },
    select: { stockDisponible: true, stockMinimum: true },
  });
  const stockCritique = pieces.filter((p) => p.stockDisponible <= p.stockMinimum).length;

  const tauxDispo = totalEquipements > 0 ? Math.round((actifs / totalEquipements) * 100) : 0;
  const tauxMP = mpPlanifieesMois > 0 ? Math.round((mpRealiseesMois / mpPlanifieesMois) * 100) : 0;

  const grouped = await prisma.biomedCorrectiveMaintenance.groupBy({
    by: ["equipementId"],
    where: {
      dateDebut: { gte: subMonths(new Date(), 12) },
      ...(sid ? { equipement: { siteId: sid } } : {}),
    },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 5,
  });
  const eqIds = grouped.map((g) => g.equipementId);
  const eqRows =
    eqIds.length > 0
      ? await prisma.biomedEquipment.findMany({
          where: { id: { in: eqIds } },
          select: { id: true, designation: true, marque: true, modele: true },
        })
      : [];
  const eqMap = new Map(eqRows.map((e) => [e.id, e]));
  const top5Pannes = grouped.map((g) => {
    const e = eqMap.get(g.equipementId);
    return {
      designation: e?.designation ?? "—",
      marque: e?.marque ?? null,
      modele: e?.modele ?? null,
      count: g._count.id,
    };
  });

  const mcAgg = await prisma.biomedCorrectiveMaintenance.groupBy({
    by: ["equipementId"],
    where: {
      dateDebut: { gte: monthStart, lte: monthEnd },
    },
    _sum: { coutTotal: true },
  });
  const mcEqIds = [...new Set(mcAgg.map((a) => a.equipementId))];
  const mcEquip =
    mcEqIds.length > 0
      ? await prisma.biomedEquipment.findMany({
          where: { id: { in: mcEqIds } },
          select: { id: true, siteId: true },
        })
      : [];
  const eqToSite = new Map(mcEquip.map((e) => [e.id, e.siteId]));
  const siteTotals = new Map<string, number>();
  for (const row of mcAgg) {
    const s = eqToSite.get(row.equipementId);
    if (!s) continue;
    const prev = siteTotals.get(s) ?? 0;
    const add = row._sum.coutTotal ? Number(row._sum.coutTotal) : 0;
    siteTotals.set(s, prev + add);
  }
  const siteIds = [...siteTotals.keys()];
  const sites =
    siteIds.length > 0
      ? await prisma.biomedSite.findMany({
          where: { id: { in: siteIds } },
          select: { id: true, code: true, nom: true },
        })
      : [];
  const coutParSite = sites.map((s) => ({
    siteCode: s.code,
    siteNom: s.nom,
    coutTotal: siteTotals.get(s.id) ?? 0,
  }));

  const alertes = await getBiomedAlertes(sid);

  const evolutionDI: Array<{ mois: string; count: number }> = [];
  for (let i = 5; i >= 0; i--) {
    const d = subMonths(new Date(), i);
    const start = startOfMonth(d);
    const end = endOfMonth(d);
    const count = await prisma.biomedInterventionRequest.count({
      where: {
        ...(sid ? { siteId: sid } : {}),
        dateCreation: { gte: start, lte: end },
      },
    });
    evolutionDI.push({
      mois: d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }),
      count,
    });
  }

  return {
    equipements: {
      total: totalEquipements,
      actifs,
      enPanne,
      enMaintenance,
    },
    interventions: { ouvertes: diOuvertes, mois: diMois },
    preventif: { enRetard: mpRetard, aVenir: mpAVenir, tauxRealisation: tauxMP },
    controleQualite: { aVenir: cqAVenir },
    stock: { critique: stockCritique },
    indicateurs: { tauxDisponibilite: tauxDispo, tauxMP },
    top5Pannes,
    coutParSite,
    alertes,
    evolutionDI,
  };
}
