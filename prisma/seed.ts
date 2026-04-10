import {
  ActionPriority,
  ActionStatus,
  AlertLevel,
  AlertStatus,
  BiomedCqStatus,
  BiomedCqType,
  BiomedCritLevel,
  BiomedDiStatus,
  BiomedEquipmentCondition,
  BiomedEquipmentStatus,
  BiomedIecClass,
  BiomedImmobilisationDecision,
  BiomedInterventionUrgency,
  BiomedInvestmentBudgetStatus,
  BiomedInvestmentPriority,
  BiomedMcFinalStatus,
  BiomedMpPeriodicity,
  BiomedPmStatus,
  BiomedProtocolMaintenanceKind,
  BiomedPurchaseStatus,
  BiomedPurchaseType,
  BiomedRoomKind,
  BiomedSiteKind,
  BiomedStockMvtType,
  BiomedTechnicianLevel,
  BiomedTechnicianSpecialty,
  DocumentCategory,
  PrismaClient,
  ProjectPracticeArea,
  ProjectStatus,
  Role,
  TaskStatus,
  WorkOrderStatus,
  WorkOrderType,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const COVER_BIOMED = "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=900&q=80";
const COVER_ARCH = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80";
const COVER_HOSP = "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=900&q=80";

async function main() {
  const adminPasswordPlain = process.env.ADMIN_SEED_PASSWORD || "Admin@12345";
  const adminPasswordHash = await bcrypt.hash(adminPasswordPlain, 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@kbio-conseil.com" },
    // Ne pas re-ecrire le mot de passe au redeploiement (publish-vps.sh lance le seed a chaque fois).
    update: { role: Role.ADMIN },
    create: {
      email: "admin@kbio-conseil.com",
      name: "Admin KBIO",
      role: Role.ADMIN,
      password: adminPasswordHash,
    },
  });

  const technician = await prisma.user.upsert({
    where: { email: "tech@kbio-conseil.com" },
    update: {},
    create: {
      email: "tech@kbio-conseil.com",
      name: "Tech Maintenance",
      role: Role.TECHNICIAN,
    },
  });

  const clientPasswordPlain = process.env.CLIENT_SEED_PASSWORD || "Client@12345";
  const clientPasswordHash = await bcrypt.hash(clientPasswordPlain, 10);
  const clientUser = await prisma.user.upsert({
    where: { email: "client@hopital-regional.example" },
    update: { role: Role.CLIENT },
    create: {
      email: "client@hopital-regional.example",
      name: "Client Hopital Regional",
      role: Role.CLIENT,
      password: clientPasswordHash,
    },
  });

  const client = await prisma.client.upsert({
    where: { code: "CLT-HR-001" },
    update: { name: "Hopital Regional de Djibouti" },
    create: {
      code: "CLT-HR-001",
      name: "Hopital Regional de Djibouti",
      country: "Djibouti",
    },
  });

  await prisma.clientUser.upsert({
    where: {
      clientId_userId: {
        clientId: client.id,
        userId: clientUser.id,
      },
    },
    update: {},
    create: {
      clientId: client.id,
      userId: clientUser.id,
    },
  });

  const project = await prisma.project.upsert({
    where: { code: "PRJ-001" },
    update: {
      status: ProjectStatus.ACTIVE,
      priority: ActionPriority.HIGH,
      progress: 42,
      country: "Djibouti",
      site: "Hopital Regional",
      type: "Deploiement GMAO",
      startDate: new Date("2024-01-01T00:00:00.000Z"),
      endDate: new Date("2026-12-31T00:00:00.000Z"),
      budgetEstimate: 280_000,
      coverImageUrl: COVER_BIOMED,
      practiceArea: ProjectPracticeArea.BIOMEDICAL_ENGINEERING,
    },
    create: {
      code: "PRJ-001",
      name: "Deploiement GMAO Usine A",
      description: "Mise en place du suivi de maintenance et des interventions.",
      ownerId: admin.id,
      status: ProjectStatus.ACTIVE,
      priority: ActionPriority.HIGH,
      progress: 42,
      country: "Djibouti",
      site: "Hopital Regional",
      type: "Deploiement GMAO",
      startDate: new Date("2024-01-01T00:00:00.000Z"),
      endDate: new Date("2026-12-31T00:00:00.000Z"),
      budgetEstimate: 280_000,
      coverImageUrl: COVER_BIOMED,
      practiceArea: ProjectPracticeArea.BIOMEDICAL_ENGINEERING,
    },
  });

  const projectCimb = await prisma.project.upsert({
    where: { code: "PRJ-DEMO-CIMB" },
    update: {
      coverImageUrl: COVER_ARCH,
      practiceArea: ProjectPracticeArea.HOSPITAL_ARCHITECTURE,
      startDate: new Date("2025-07-01T00:00:00.000Z"),
      budgetEstimate: 100_000,
    },
    create: {
      code: "PRJ-DEMO-CIMB",
      name: "CIMB",
      ownerId: admin.id,
      status: ProjectStatus.ACTIVE,
      startDate: new Date("2025-07-01T00:00:00.000Z"),
      budgetEstimate: 100_000,
      coverImageUrl: COVER_ARCH,
      practiceArea: ProjectPracticeArea.HOSPITAL_ARCHITECTURE,
    },
  });

  const projectTec = await prisma.project.upsert({
    where: { code: "PRJ-DEMO-TEC" },
    update: {
      coverImageUrl: COVER_HOSP,
      practiceArea: ProjectPracticeArea.BIOMEDICAL_ENGINEERING,
      startDate: new Date("2025-03-15T00:00:00.000Z"),
      budgetEstimate: 45_000,
    },
    create: {
      code: "PRJ-DEMO-TEC",
      name: "TEC INT - CHUD",
      ownerId: admin.id,
      status: ProjectStatus.ACTIVE,
      startDate: new Date("2025-03-15T00:00:00.000Z"),
      budgetEstimate: 45_000,
      coverImageUrl: COVER_HOSP,
      practiceArea: ProjectPracticeArea.BIOMEDICAL_ENGINEERING,
    },
  });

  const projectFse = await prisma.project.upsert({
    where: { code: "PRJ-DEMO-FSE" },
    update: {
      coverImageUrl: COVER_BIOMED,
      practiceArea: ProjectPracticeArea.BIOMEDICAL_ENGINEERING,
      startDate: new Date("2025-01-01T00:00:00.000Z"),
      endDate: new Date("2026-06-30T00:00:00.000Z"),
      budgetEstimate: 132_500,
    },
    create: {
      code: "PRJ-DEMO-FSE",
      name: "FSE - RWANDA",
      ownerId: admin.id,
      status: ProjectStatus.ACTIVE,
      startDate: new Date("2025-01-01T00:00:00.000Z"),
      endDate: new Date("2026-06-30T00:00:00.000Z"),
      budgetEstimate: 132_500,
      coverImageUrl: COVER_BIOMED,
      practiceArea: ProjectPracticeArea.BIOMEDICAL_ENGINEERING,
    },
  });

  for (const pid of [projectCimb.id, projectTec.id, projectFse.id]) {
    await prisma.projectClient.upsert({
      where: { projectId_clientId: { projectId: pid, clientId: client.id } },
      update: {},
      create: { projectId: pid, clientId: client.id },
    });
  }

  await prisma.projectClient.upsert({
    where: {
      projectId_clientId: {
        projectId: project.id,
        clientId: client.id,
      },
    },
    update: {},
    create: {
      projectId: project.id,
      clientId: client.id,
    },
  });

  await prisma.clientPortalAccessCode.upsert({
    where: {
      clientId_projectId: {
        clientId: client.id,
        projectId: project.id,
      },
    },
    update: {
      code: "KBIO-DEMO001",
      active: true,
    },
    create: {
      clientId: client.id,
      projectId: project.id,
      code: "KBIO-DEMO001",
      active: true,
      generatedBy: admin.id,
    },
  });

  await prisma.projectMember.upsert({
    where: {
      projectId_userId: {
        projectId: project.id,
        userId: technician.id,
      },
    },
    update: {},
    create: {
      projectId: project.id,
      userId: technician.id,
      roleInProject: "TECH_LEAD",
    },
  });

  const eqCategory = await prisma.equipmentCategory.upsert({
    where: { name: "Thermique" },
    update: {},
    create: { name: "Thermique" },
  });

  const asset = await prisma.asset.upsert({
    where: { code: "EQ-CH-001" },
    update: {
      projectId: project.id,
      categoryId: eqCategory.id,
      site: "Bloc technique",
      criticality: ActionPriority.CRITICAL,
      visibleToClient: true,
    },
    create: {
      code: "EQ-CH-001",
      name: "Chaudiere principale",
      category: "Thermique",
      location: "Atelier 1",
      projectId: project.id,
      categoryId: eqCategory.id,
      site: "Bloc technique",
      criticality: ActionPriority.CRITICAL,
      visibleToClient: true,
    },
  });

  await prisma.task.createMany({
    data: [
      {
        title: "Creer les gammes preventives",
        status: TaskStatus.IN_PROGRESS,
        projectId: project.id,
        assigneeId: technician.id,
        priority: 1,
      },
      {
        title: "Former les techniciens",
        status: TaskStatus.TODO,
        projectId: project.id,
        assigneeId: admin.id,
        priority: 2,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.workOrder.upsert({
    where: { reference: "OT-0001" },
    update: { projectId: project.id, visibleToClient: true },
    create: {
      reference: "OT-0001",
      title: "Remplacement joint de pompe",
      description: "Fuite detectee pendant ronde du matin.",
      type: WorkOrderType.CORRECTIVE,
      status: WorkOrderStatus.IN_PROGRESS,
      assetId: asset.id,
      assigneeId: technician.id,
      projectId: project.id,
      visibleToClient: true,
    },
  });

  const actionPlan = await prisma.actionPlan.create({
    data: {
      projectId: project.id,
      title: "Plan d'action de mise en service",
      description: "Actions prioritaires pour stabilisation d'exploitation.",
      status: ActionStatus.IN_PROGRESS,
    },
  });

  const projectAction = await prisma.projectAction.create({
    data: {
      actionPlanId: actionPlan.id,
      projectId: project.id,
      title: "Valider check-list preventive mensuelle",
      description: "Validation conjointe K'BIO / equipe locale.",
      status: ActionStatus.IN_PROGRESS,
      priority: ActionPriority.HIGH,
      assigneeId: technician.id,
      visibleToClient: true,
    },
  });

  await prisma.maintenancePlan.create({
    data: {
      projectId: project.id,
      equipmentId: asset.id,
      periodicityDays: 30,
      checklist: "Controle pression, verification securites, purge.",
      active: true,
    },
  });

  await prisma.intervention.create({
    data: {
      projectId: project.id,
      equipmentId: asset.id,
      type: WorkOrderType.PREVENTIVE,
      status: WorkOrderStatus.IN_PROGRESS,
      summary: "Intervention preventive mensuelle lancee.",
      internalNotes: "RAS sur anomalies majeures.",
      visibleToClient: true,
      createdById: technician.id,
    },
  });

  await prisma.milestone.create({
    data: {
      projectId: project.id,
      title: "Go-live dashboard client",
      status: ActionStatus.TODO,
      visibleToClient: true,
    },
  });

  await prisma.projectUpdate.create({
    data: {
      projectId: project.id,
      title: "Etat d'avancement hebdomadaire",
      body: "Progression stable, indicateurs disponibles, prochaine etape: recette client.",
      visibleToClient: true,
      createdById: admin.id,
    },
  });

  await prisma.projectDocument.create({
    data: {
      projectId: project.id,
      category: DocumentCategory.REPORT,
      name: "Rapport-avancement-Semaine-14.pdf",
      storagePath: "demo/reports/rapport-semaine-14.pdf",
      mimeType: "application/pdf",
      sizeBytes: 184320,
      visibleToClient: true,
      uploadedById: admin.id,
    },
  });

  await prisma.alert.create({
    data: {
      projectId: project.id,
      equipmentId: asset.id,
      actionId: projectAction.id,
      level: AlertLevel.WARNING,
      message: "Maintenance preventive a confirmer avant fin de semaine.",
      status: AlertStatus.OPEN,
    },
  });

  await prisma.activityLog.create({
    data: {
      userId: admin.id,
      projectId: project.id,
      entity: "ProjectAction",
      entityId: projectAction.id,
      action: "CREATE",
      metadata: { source: "seed", visibility: "client" },
      ipAddress: "127.0.0.1",
    },
  });

  const biomedSite = await prisma.biomedSite.upsert({
    where: { code: "CHU-DEMO" },
    update: {},
    create: {
      code: "CHU-DEMO",
      nom: "CHU Demonstration biomedical",
      typeEtablissement: BiomedSiteKind.HOPITAL,
      ville: "Paris",
      pays: "France",
    },
  });

  const biomedBat = await prisma.biomedBuilding.upsert({
    where: { siteId_code: { siteId: biomedSite.id, code: "BAT-A" } },
    update: {},
    create: {
      siteId: biomedSite.id,
      code: "BAT-A",
      nom: "Batiment principal",
    },
  });

  const biomedLocal = await prisma.biomedRoom.upsert({
    where: { siteId_code: { siteId: biomedSite.id, code: "BLOC-1" } },
    update: {},
    create: {
      siteId: biomedSite.id,
      batimentId: biomedBat.id,
      code: "BLOC-1",
      nom: "Bloc technique",
      typeLocal: BiomedRoomKind.TECHNIQUE,
    },
  });

  const biomedFam = await prisma.biomedFamily.upsert({
    where: { code: "FAM-IMA" },
    update: {},
    create: {
      code: "FAM-IMA",
      nom: "Imagerie medicale",
      classeIEC: BiomedIecClass.IEC_IIB,
      periodiciteDefaut: BiomedMpPeriodicity.ANNUEL,
    },
  });

  const biomedKit = await prisma.biomedMaintenanceKit.upsert({
    where: { code: "KIT-RM-STD" },
    update: {},
    create: {
      code: "KIT-RM-STD",
      designation: "Kit maintenance IRM standard",
      marque: "Generique",
      frequenceUtilisation: BiomedMpPeriodicity.ANNUEL,
    },
  });

  const biomedPiece = await prisma.biomedSparePart.upsert({
    where: { reference: "FILTRE-HEPA-01" },
    update: { siteId: biomedSite.id },
    create: {
      reference: "FILTRE-HEPA-01",
      designation: "Filtre HEPA compatible bloc IRM",
      stockDisponible: 3,
      stockMinimum: 3,
      siteId: biomedSite.id,
      criticiteStock: BiomedCritLevel.ELEVE,
    },
  });

  await prisma.biomedKitPart.upsert({
    where: { kitId_pieceId: { kitId: biomedKit.id, pieceId: biomedPiece.id } },
    update: {},
    create: { kitId: biomedKit.id, pieceId: biomedPiece.id, quantite: 1 },
  });

  await prisma.biomedSparePart.upsert({
    where: { reference: "SONDE-US-9M" },
    update: {},
    create: {
      reference: "SONDE-US-9M",
      designation: "Sonde echographe 9 MHz",
      stockDisponible: 0,
      stockMinimum: 2,
      siteId: biomedSite.id,
      criticiteStock: BiomedCritLevel.CRITIQUE,
    },
  });

  const biomedProto = await prisma.biomedProtocol.upsert({
    where: { code: "PROTO-RM-AN" },
    update: {},
    create: {
      code: "PROTO-RM-AN",
      designation: "Maintenance annuelle IRM",
      familleId: biomedFam.id,
      typeMaintenance: BiomedProtocolMaintenanceKind.PREVENTIVE,
      frequence: BiomedMpPeriodicity.ANNUEL,
      kitMaintenanceId: biomedKit.id,
      niveauTechnicienRequis: BiomedTechnicianLevel.NIVEAU2,
    },
  });

  const biomedTech = await prisma.biomedTechnician.upsert({
    where: { matricule: "TECH-BIO-01" },
    update: { userId: technician.id },
    create: {
      matricule: "TECH-BIO-01",
      nom: "Dupont",
      prenom: "Marie",
      specialite: BiomedTechnicianSpecialty.BIOMED,
      niveauQualification: BiomedTechnicianLevel.NIVEAU3,
      email: "tech@kbio-conseil.com",
      userId: technician.id,
    },
  });

  const biomedEq = await prisma.biomedEquipment.upsert({
    where: { numeroGMAO: "GMAO-DEMO-IRM-01" },
    update: {},
    create: {
      numeroGMAO: "GMAO-DEMO-IRM-01",
      numeroInventaire: "INV-IRM-9001",
      designation: "IRM 1,5T — salle A",
      familleId: biomedFam.id,
      siteId: biomedSite.id,
      localId: biomedLocal.id,
      marque: "Siemens",
      modele: "Magnetom Aera",
      classeIEC: BiomedIecClass.IEC_IIB,
      criticite: BiomedCritLevel.CRITIQUE,
      statut: BiomedEquipmentStatus.EN_SERVICE,
      etatGeneral: BiomedEquipmentCondition.BON,
      protocoleId: biomedProto.id,
      periodiciteMP: BiomedMpPeriodicity.ANNUEL,
      responsableId: admin.id,
      observations: "Equipement seed module biomedical integre.",
    },
  });

  await prisma.biomedEquipment.upsert({
    where: { numeroGMAO: "GMAO-DEMO-US-02" },
    update: {},
    create: {
      numeroGMAO: "GMAO-DEMO-US-02",
      designation: "Echographe portable",
      familleId: biomedFam.id,
      siteId: biomedSite.id,
      classeIEC: BiomedIecClass.IEC_IIA,
      criticite: BiomedCritLevel.MOYEN,
      statut: BiomedEquipmentStatus.EN_PANNE,
      etatGeneral: BiomedEquipmentCondition.MOYEN,
      periodiciteMP: BiomedMpPeriodicity.TRIMESTRIEL,
    },
  });

  await prisma.biomedInterventionRequest.upsert({
    where: { numeroDI: "DI-DEMO-0001" },
    update: {},
    create: {
      numeroDI: "DI-DEMO-0001",
      siteId: biomedSite.id,
      localId: biomedLocal.id,
      equipementId: biomedEq.id,
      descriptionPanne: "Erreur gradient — arret spontane sequence",
      niveauUrgence: BiomedInterventionUrgency.URGENT,
      criticiteEquipement: BiomedCritLevel.CRITIQUE,
      statut: BiomedDiStatus.OUVERTE,
      demandeurNom: "Service imagerie",
    },
  });

  const mpDate = new Date();
  mpDate.setDate(mpDate.getDate() + 14);
  await prisma.biomedPreventiveMaintenance.upsert({
    where: { numeroMP: "MP-DEMO-0001" },
    update: {},
    create: {
      numeroMP: "MP-DEMO-0001",
      equipementId: biomedEq.id,
      protocoleId: biomedProto.id,
      frequence: BiomedMpPeriodicity.ANNUEL,
      datePrevue: mpDate,
      statut: BiomedPmStatus.PLANIFIEE,
    },
  });

  const mpLate = new Date();
  mpLate.setDate(mpLate.getDate() - 10);
  await prisma.biomedPreventiveMaintenance.upsert({
    where: { numeroMP: "MP-DEMO-RETARD" },
    update: {},
    create: {
      numeroMP: "MP-DEMO-RETARD",
      equipementId: biomedEq.id,
      frequence: BiomedMpPeriodicity.TRIMESTRIEL,
      datePrevue: mpLate,
      statut: BiomedPmStatus.EN_RETARD,
    },
  });

  await prisma.biomedCorrectiveMaintenance.upsert({
    where: { numeroMC: "MC-DEMO-0001" },
    update: {},
    create: {
      numeroMC: "MC-DEMO-0001",
      equipementId: biomedEq.id,
      technicienId: biomedTech.id,
      panneConstatee: "Veilleuse alarme",
      statutFinal: BiomedMcFinalStatus.RESOLU,
      dateDebut: new Date(),
      coutTotal: 450,
    },
  });

  await prisma.biomedQualityControl.upsert({
    where: { numeroCQ: "CQ-DEMO-0001" },
    update: {},
    create: {
      numeroCQ: "CQ-DEMO-0001",
      equipementId: biomedEq.id,
      typeControle: BiomedCqType.PERFORMANCE,
      periodicite: BiomedMpPeriodicity.ANNUEL,
      datePrevue: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      statut: BiomedCqStatus.PLANIFIE,
    },
  });

  await prisma.biomedStockMovement.upsert({
    where: { numeroMvt: "MVT-DEMO-0001" },
    update: {},
    create: {
      numeroMvt: "MVT-DEMO-0001",
      type: BiomedStockMvtType.SORTIE,
      pieceId: biomedPiece.id,
      quantite: 1,
      quantiteAvant: 3,
      quantiteApres: 2,
      motif: "Maintenance IRM demo",
      equipementId: biomedEq.id,
      siteId: biomedSite.id,
      userId: admin.id,
    },
  });

  await prisma.biomedPurchaseRequest.upsert({
    where: { numeroDA: "DA-DEMO-0001" },
    update: {},
    create: {
      numeroDA: "DA-DEMO-0001",
      typeAchat: BiomedPurchaseType.PIECE_DETACHEE,
      pieceId: biomedPiece.id,
      designation: "Reassort filtres HEPA",
      quantite: 4,
      statut: BiomedPurchaseStatus.SOUMIS,
      urgence: true,
    },
  });

  await prisma.biomedAssetFreeze.upsert({
    where: { numeroImmo: "IMMO-DEMO-01" },
    update: {},
    create: {
      numeroImmo: "IMMO-DEMO-01",
      equipementId: biomedEq.id,
      dateImmobilisation: new Date(),
      cause: "Controle reglementaire en cours",
      decision: BiomedImmobilisationDecision.EN_ATTENTE_IMMO,
    },
  });

  await prisma.biomedInvestmentPlan.upsert({
    where: { numeroPDI: "PDI-DEMO-2027-01" },
    update: {},
    create: {
      numeroPDI: "PDI-DEMO-2027-01",
      annee: 2027,
      siteId: biomedSite.id,
      familleId: biomedFam.id,
      equipementId: biomedEq.id,
      designationNouveau: "IRM 3T — remplacement programme",
      criticite: BiomedCritLevel.ELEVE,
      coutRemplacement: 1_800_000,
      priorite: BiomedInvestmentPriority.P2,
      statutBudgetaire: BiomedInvestmentBudgetStatus.PROPOSE,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
