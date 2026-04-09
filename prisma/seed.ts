import {
  ActionPriority,
  ActionStatus,
  AlertLevel,
  AlertStatus,
  DocumentCategory,
  PrismaClient,
  ProjectStatus,
  Role,
  TaskStatus,
  WorkOrderStatus,
  WorkOrderType,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPasswordPlain = process.env.ADMIN_SEED_PASSWORD || "Admin@12345";
  const adminPasswordHash = await bcrypt.hash(adminPasswordPlain, 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@kbio-conseil.com" },
    update: {
      password: adminPasswordHash,
      role: Role.ADMIN,
    },
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
    update: {
      role: Role.CLIENT,
      password: clientPasswordHash,
    },
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
    },
  });

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
