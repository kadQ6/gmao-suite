import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

const createBody = z.object({
  code: z.string().min(1).max(64),
  name: z.string().min(1).max(200),
  category: z.string().min(1).max(120),
  location: z.string().max(200).optional().nullable(),
  projectId: z.string().optional().nullable(),
});

export async function GET() {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  const assets = await prisma.asset.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      project: { select: { id: true, code: true, name: true } },
      _count: { select: { workOrders: true } },
    },
  });

  return NextResponse.json(assets);
}

export async function POST(req: Request) {
  const auth = await requireSession();
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

  const { code, name, category, location, projectId } = parsed.data;

  if (projectId) {
    const p = await prisma.project.findUnique({ where: { id: projectId }, select: { id: true } });
    if (!p) {
      return NextResponse.json({ error: "Projet introuvable." }, { status: 400 });
    }
  }

  try {
    const asset = await prisma.asset.create({
      data: {
        code: code.trim(),
        name: name.trim(),
        category: category.trim(),
        location: location?.trim() || null,
        projectId: projectId ?? null,
      },
      include: {
        project: { select: { id: true, code: true, name: true } },
        _count: { select: { workOrders: true } },
      },
    });
    return NextResponse.json(asset, { status: 201 });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json({ error: "Ce code equipement est deja utilise." }, { status: 409 });
    }
    throw e;
  }
}
