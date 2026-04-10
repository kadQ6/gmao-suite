"use server";

import {
  BiomedDiStatus,
  BiomedEquipmentCondition,
  BiomedEquipmentStatus,
  BiomedIecClass,
  BiomedInterventionUrgency,
  BiomedMcFinalStatus,
  BiomedMpPeriodicity,
  BiomedCritLevel,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canWriteBiomed } from "@/lib/biomed/rbac";
import { nextBiomedSequence } from "@/lib/biomed/sequence";
import { prisma } from "@/lib/prisma";

export async function createBiomedEquipment(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!canWriteBiomed(session?.user.role)) {
    throw new Error("Non autorise");
  }

  const numeroGMAO = String(formData.get("numeroGMAO") ?? "").trim();
  const designation = String(formData.get("designation") ?? "").trim();
  const familleId = String(formData.get("familleId") ?? "").trim();
  const siteId = String(formData.get("siteId") ?? "").trim();

  if (!numeroGMAO || !designation || !familleId || !siteId) {
    throw new Error("Champs obligatoires manquants");
  }

  const created = await prisma.biomedEquipment.create({
    data: {
      numeroGMAO,
      designation,
      familleId,
      siteId,
      classeIEC: BiomedIecClass.IEC_IIA,
      criticite: BiomedCritLevel.MOYEN,
      statut: BiomedEquipmentStatus.EN_SERVICE,
      etatGeneral: BiomedEquipmentCondition.BON,
      periodiciteMP: BiomedMpPeriodicity.ANNUEL,
    },
  });

  revalidatePath("/portal/gmao-biomed");
  revalidatePath("/portal/gmao-biomed/equipements");
  redirect(`/portal/gmao-biomed/equipements/${created.id}`);
}

const URGENCE_VALUES = new Set<string>(Object.values(BiomedInterventionUrgency));
const MC_STATUT_VALUES = new Set<string>(Object.values(BiomedMcFinalStatus));

export async function createBiomedInterventionRequest(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!canWriteBiomed(session?.user.role)) {
    throw new Error("Non autorise");
  }

  const equipementId = String(formData.get("equipementId") ?? "").trim();
  const descriptionPanne = String(formData.get("descriptionPanne") ?? "").trim();
  const niveauRaw = String(formData.get("niveauUrgence") ?? "NORMAL").trim();
  const niveauUrgence = URGENCE_VALUES.has(niveauRaw)
    ? (niveauRaw as BiomedInterventionUrgency)
    : BiomedInterventionUrgency.NORMAL;
  const demandeurNom = String(formData.get("demandeurNom") ?? "").trim() || null;

  if (!equipementId || !descriptionPanne) {
    throw new Error("Equipement et description sont obligatoires");
  }

  const eq = await prisma.biomedEquipment.findUnique({
    where: { id: equipementId },
    select: { id: true, siteId: true, localId: true, criticite: true },
  });
  if (!eq) {
    throw new Error("Equipement introuvable");
  }

  const created = await prisma.$transaction(async (tx) => {
    const numeroDI = await nextBiomedSequence(tx, "DI");
    return tx.biomedInterventionRequest.create({
      data: {
        numeroDI,
        equipementId: eq.id,
        siteId: eq.siteId,
        localId: eq.localId,
        descriptionPanne,
        niveauUrgence,
        criticiteEquipement: eq.criticite,
        demandeurNom,
        statut: BiomedDiStatus.OUVERTE,
      },
    });
  });

  revalidatePath("/portal/gmao-biomed");
  revalidatePath("/portal/gmao-biomed/interventions");
  redirect(`/portal/gmao-biomed/interventions/${created.id}`);
}

export async function createBiomedCorrectiveFromDi(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!canWriteBiomed(session?.user.role)) {
    throw new Error("Non autorise");
  }

  const diId = String(formData.get("diId") ?? "").trim();
  const diagnostic = String(formData.get("diagnostic") ?? "").trim();
  const actionCorrective = String(formData.get("actionCorrective") ?? "").trim();
  const statutRaw = String(formData.get("statutFinal") ?? "RESOLU").trim();
  const statutFinal = MC_STATUT_VALUES.has(statutRaw)
    ? (statutRaw as BiomedMcFinalStatus)
    : BiomedMcFinalStatus.RESOLU;
  const coutStr = String(formData.get("coutTotal") ?? "").trim();
  const coutTotal =
    coutStr === "" ? undefined : Number.parseFloat(coutStr.replace(",", "."));
  const now = new Date();

  if (!diId || !diagnostic || !actionCorrective) {
    throw new Error("Diagnostic et action corrective sont obligatoires");
  }
  if (coutTotal !== undefined && Number.isNaN(coutTotal)) {
    throw new Error("Cout invalide");
  }

  const di = await prisma.biomedInterventionRequest.findUnique({
    where: { id: diId },
    include: { maintenancesCur: { select: { id: true } } },
  });
  if (!di) {
    throw new Error("Demande introuvable");
  }
  if (di.statut === BiomedDiStatus.CLOTUREE || di.statut === BiomedDiStatus.ANNULEE) {
    throw new Error("Cette DI est deja cloturee ou annulee");
  }
  if (di.maintenancesCur.length > 0) {
    throw new Error("Une MC est deja liee a cette DI");
  }

  const diStatut: BiomedDiStatus =
    statutFinal === BiomedMcFinalStatus.RESOLU
      ? BiomedDiStatus.CLOTUREE
      : statutFinal === BiomedMcFinalStatus.PARTIEL
        ? BiomedDiStatus.RESOLUE
        : BiomedDiStatus.EN_COURS;

  await prisma.$transaction(async (tx) => {
    const numeroMC = await nextBiomedSequence(tx, "MC");
    await tx.biomedCorrectiveMaintenance.create({
      data: {
        numeroMC,
        diId: di.id,
        equipementId: di.equipementId,
        panneConstatee: di.descriptionPanne,
        diagnostic,
        actionCorrective,
        dateDebut: now,
        dateFin: now,
        statutFinal,
        validation: statutFinal === BiomedMcFinalStatus.RESOLU,
        coutTotal,
      },
    });
    await tx.biomedInterventionRequest.update({
      where: { id: di.id },
      data: {
        statut: diStatut,
        dateIntervention: now,
        dateCloture: diStatut === BiomedDiStatus.CLOTUREE ? now : undefined,
        diagnostic,
        actionRealisee: actionCorrective,
        validationFinale: statutFinal === BiomedMcFinalStatus.RESOLU,
        coutTotal,
      },
    });
  });

  revalidatePath("/portal/gmao-biomed");
  revalidatePath("/portal/gmao-biomed/interventions");
  revalidatePath(`/portal/gmao-biomed/interventions/${diId}`);
  revalidatePath("/portal/gmao-biomed/maintenance/curative");
  redirect(`/portal/gmao-biomed/interventions/${diId}`);
}
