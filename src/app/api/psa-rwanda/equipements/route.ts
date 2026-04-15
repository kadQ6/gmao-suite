import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const siteId = req.nextUrl.searchParams.get("siteId");
  const where = siteId ? { siteId } : {};

  const equips = await prisma.psaEquipment.findMany({
    where,
    orderBy: { code: "asc" },
    include: {
      site: { select: { id: true, nom: true, code: true } },
      _count: { select: { maintenances: true, piecesBesoins: true } },
    },
  });
  return NextResponse.json(equips);
}

export async function POST(req: Request) {
  const body = await req.json();
  const equip = await prisma.psaEquipment.create({ data: body });
  return NextResponse.json(equip, { status: 201 });
}
