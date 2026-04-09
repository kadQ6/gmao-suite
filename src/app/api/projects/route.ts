import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession, requireWritableSession } from "@/lib/api-auth";
import { getProjectScopeWhere } from "@/lib/portal-scope";
import { prisma } from "@/lib/prisma";

const createBody = z.object({
  code: z.string().min(1).max(64),
  name: z.string().min(1).max(200),
  description: z.string().max(4000).optional().nullable(),
});

export async function GET() {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  const where = getProjectScopeWhere({
    userId: auth.session.user.id,
    role: auth.session.user.role,
    canWrite: true,
  });

  const projects = await prisma.project.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      _count: { select: { tasks: true } },
    },
  });

  return NextResponse.json(projects);
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

  const { code, name, description } = parsed.data;
  const codeTrim = code.trim();
  const nameTrim = name.trim();

  try {
    const project = await prisma.project.create({
      data: {
        code: codeTrim,
        name: nameTrim,
        description: description?.trim() || null,
        ownerId: auth.session.user.id,
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { tasks: true } },
      },
    });
    return NextResponse.json(project, { status: 201 });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json({ error: "Ce code projet est deja utilise." }, { status: 409 });
    }
    throw e;
  }
}
