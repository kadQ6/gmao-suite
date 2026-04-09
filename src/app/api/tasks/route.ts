import { TaskStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession, requireWritableSession } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

const createBody = z.object({
  title: z.string().min(1).max(500),
  projectId: z.string().min(1),
  description: z.string().max(4000).optional().nullable(),
  priority: z.number().int().min(1).max(5).optional(),
  assigneeId: z.string().min(1).optional().nullable(),
  status: z.nativeEnum(TaskStatus).optional(),
});

export async function GET() {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  const tasks = await prisma.task.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      assignee: { select: { id: true, name: true, email: true } },
      project: { select: { id: true, name: true, code: true } },
    },
  });

  return NextResponse.json(tasks);
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

  const { title, projectId, description, priority, assigneeId, status } = parsed.data;

  const project = await prisma.project.findUnique({ where: { id: projectId }, select: { id: true } });
  if (!project) {
    return NextResponse.json({ error: "Projet introuvable." }, { status: 404 });
  }

  if (assigneeId) {
    const user = await prisma.user.findUnique({ where: { id: assigneeId }, select: { id: true } });
    if (!user) {
      return NextResponse.json({ error: "Assigne introuvable." }, { status: 400 });
    }
  }

  const task = await prisma.task.create({
    data: {
      title: title.trim(),
      description: description?.trim() || null,
      projectId,
      priority: priority ?? 2,
      assigneeId: assigneeId ?? null,
      status: status ?? TaskStatus.TODO,
    },
    include: {
      assignee: { select: { id: true, name: true, email: true } },
      project: { select: { id: true, name: true, code: true } },
    },
  });

  return NextResponse.json(task, { status: 201 });
}
