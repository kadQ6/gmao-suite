import { randomUUID } from "node:crypto";
import { Prisma, WorkOrderStatus, WorkOrderType } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession, requireWritableSession } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

const createBody = z.object({
  title: z.string().min(1).max(300),
  description: z.string().max(4000).optional().nullable(),
  type: z.nativeEnum(WorkOrderType),
  assetId: z.string().min(1),
  projectId: z.string().optional().nullable(),
  assigneeId: z.string().optional().nullable(),
});

export async function GET() {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  const workOrders = await prisma.workOrder.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      asset: { select: { id: true, code: true, name: true } },
      project: { select: { id: true, code: true, name: true } },
      assignee: { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json(workOrders);
}

export async function POST(req: Request) {
  const auth = await requireWritableSession();
  if (!auth.ok) return auth.response;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
  }

  const parsed = createBody.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Donnees invalides.", details: parsed.error.flatten() }, { status: 400 });
  }

  const { title, description, type, assetId, projectId, assigneeId } = parsed.data;

  const asset = await prisma.asset.findUnique({ where: { id: assetId }, select: { id: true } });
  if (!asset) {
    return NextResponse.json({ error: "Equipement introuvable." }, { status: 400 });
  }

  if (projectId) {
    const p = await prisma.project.findUnique({ where: { id: projectId }, select: { id: true } });
    if (!p) {
      return NextResponse.json({ error: "Projet introuvable." }, { status: 400 });
    }
  }

  if (assigneeId) {
    const u = await prisma.user.findUnique({ where: { id: assigneeId }, select: { id: true } });
    if (!u) {
      return NextResponse.json({ error: "Assigne introuvable." }, { status: 400 });
    }
  }

  const reference = `OT-${randomUUID().slice(0, 8).toUpperCase()}`;

  try {
    const workOrder = await prisma.workOrder.create({
      data: {
        reference,
        title: title.trim(),
        description: description?.trim() || null,
        type,
        status: WorkOrderStatus.OPEN,
        assetId,
        projectId: projectId ?? null,
        assigneeId: assigneeId ?? null,
      },
      include: {
        asset: { select: { id: true, code: true, name: true } },
        project: { select: { id: true, code: true, name: true } },
        assignee: { select: { id: true, name: true, email: true } },
      },
    });
    return NextResponse.json(workOrder, { status: 201 });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json({ error: "Reference OT en conflit, reessayez." }, { status: 409 });
    }
    throw e;
  }
}
