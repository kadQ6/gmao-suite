import { PrismaClient, Role, TaskStatus, WorkOrderStatus, WorkOrderType } from "@prisma/client";
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

  const project = await prisma.project.upsert({
    where: { code: "PRJ-001" },
    update: {},
    create: {
      code: "PRJ-001",
      name: "Deploiement GMAO Usine A",
      description: "Mise en place du suivi de maintenance et des interventions.",
      ownerId: admin.id,
    },
  });

  const asset = await prisma.asset.upsert({
    where: { code: "EQ-CH-001" },
    update: { projectId: project.id },
    create: {
      code: "EQ-CH-001",
      name: "Chaudiere principale",
      category: "Thermique",
      location: "Atelier 1",
      projectId: project.id,
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
    update: { projectId: project.id },
    create: {
      reference: "OT-0001",
      title: "Remplacement joint de pompe",
      description: "Fuite detectee pendant ronde du matin.",
      type: WorkOrderType.CORRECTIVE,
      status: WorkOrderStatus.IN_PROGRESS,
      assetId: asset.id,
      assigneeId: technician.id,
      projectId: project.id,
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
