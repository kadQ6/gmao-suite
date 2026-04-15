import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const siteId = req.nextUrl.searchParams.get("siteId");
  const where = siteId ? { equipement: { siteId } } : {};
  const rows = await prisma.psaAction.findMany({
    where,
    orderBy: [{ statut: "asc" }, { priorite: "asc" }],
    include: {
      equipement: {
        select: { id: true, code: true, designation: true, statut: true, site: { select: { id: true, nom: true, code: true } } },
      },
    },
  });
  return NextResponse.json(rows);
}

export async function PATCH(req: Request) {
  const body = await req.json();
  const { id, ...data } = body;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const row = await prisma.psaAction.update({
    where: { id },
    data: {
      ...data,
      coutEstime: data.coutEstime !== undefined ? (data.coutEstime ? parseFloat(data.coutEstime) : null) : undefined,
      echeance: data.echeance !== undefined ? (data.echeance ? new Date(data.echeance) : null) : undefined,
    },
  });
  return NextResponse.json(row);
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await prisma.psaAction.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
