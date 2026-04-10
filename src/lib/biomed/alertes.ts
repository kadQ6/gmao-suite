import {
  BiomedCqStatus,
  BiomedDiStatus,
  BiomedEquipmentStatus,
  BiomedCritLevel,
  BiomedPmStatus,
} from "@prisma/client";
import { addDays, subHours } from "date-fns";
import { prisma } from "@/lib/prisma";

export type BiomedAlerte = {
  type: string;
  niveau: "danger" | "warning" | "info";
  message: string;
  count: number;
};

function equipmentSiteWhere(siteId: string | undefined) {
  return siteId ? { siteId, actif: true } : { actif: true };
}

export async function getBiomedAlertes(siteId?: string | null): Promise<BiomedAlerte[]> {
  const sid = siteId ?? undefined;
  const eqWhere = equipmentSiteWhere(sid);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const in7 = addDays(today, 7);
  const in30 = addDays(today, 30);
  const alertes: BiomedAlerte[] = [];

  const mpRetard = await prisma.biomedPreventiveMaintenance.count({
    where: {
      statut: BiomedPmStatus.EN_RETARD,
      equipement: eqWhere,
    },
  });
  if (mpRetard > 0) {
    alertes.push({
      type: "mp_retard",
      niveau: "danger",
      message: `${mpRetard} maintenance(s) preventive(s) en retard`,
      count: mpRetard,
    });
  }

  const mpProchaines = await prisma.biomedPreventiveMaintenance.count({
    where: {
      statut: BiomedPmStatus.PLANIFIEE,
      datePrevue: { gte: today, lte: in7 },
      equipement: eqWhere,
    },
  });
  if (mpProchaines > 0) {
    alertes.push({
      type: "mp_prochaine",
      niveau: "warning",
      message: `${mpProchaines} maintenance(s) a realiser cette semaine`,
      count: mpProchaines,
    });
  }

  const cutoff48h = subHours(new Date(), 48);
  const diWhere = {
    statut: { in: [BiomedDiStatus.OUVERTE, BiomedDiStatus.AFFECTEE] },
    dateCreation: { lt: cutoff48h },
    ...(sid ? { siteId: sid } : {}),
  };
  const diAncienne = await prisma.biomedInterventionRequest.count({ where: diWhere });
  if (diAncienne > 0) {
    alertes.push({
      type: "di_non_traitee",
      niveau: "danger",
      message: `${diAncienne} demande(s) d'intervention non traitee(s) > 48h`,
      count: diAncienne,
    });
  }

  const cqRetard = await prisma.biomedQualityControl.count({
    where: {
      statut: BiomedCqStatus.EN_RETARD,
      equipement: eqWhere,
    },
  });
  if (cqRetard > 0) {
    alertes.push({
      type: "cq_retard",
      niveau: "danger",
      message: `${cqRetard} controle(s) qualite en retard`,
      count: cqRetard,
    });
  }

  const pieces = await prisma.biomedSparePart.findMany({
    where: { actif: true },
    select: { stockDisponible: true, stockMinimum: true },
  });
  const stockCritique = pieces.filter((p) => p.stockDisponible <= p.stockMinimum).length;
  if (stockCritique > 0) {
    alertes.push({
      type: "stock_critique",
      niveau: "warning",
      message: `${stockCritique} piece(s) en stock critique`,
      count: stockCritique,
    });
  }

  const garantiesProchaines = await prisma.biomedEquipment.count({
    where: {
      ...eqWhere,
      sousGarantie: true,
      dateFinGarantie: { gte: today, lte: in30 },
    },
  });
  if (garantiesProchaines > 0) {
    alertes.push({
      type: "garantie_expiration",
      niveau: "info",
      message: `${garantiesProchaines} garantie(s) expire(nt) dans 30 jours`,
      count: garantiesProchaines,
    });
  }

  const eqCritiquesEnPanne = await prisma.biomedEquipment.count({
    where: {
      ...eqWhere,
      statut: BiomedEquipmentStatus.EN_PANNE,
      criticite: BiomedCritLevel.CRITIQUE,
    },
  });
  if (eqCritiquesEnPanne > 0) {
    alertes.push({
      type: "eq_critique_panne",
      niveau: "danger",
      message: `${eqCritiquesEnPanne} equipement(s) CRITIQUE(s) en panne`,
      count: eqCritiquesEnPanne,
    });
  }

  return alertes;
}
