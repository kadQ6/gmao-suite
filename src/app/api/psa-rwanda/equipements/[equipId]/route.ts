import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ equipId: string }> }
) {
  const { equipId } = await params;
  const equip = await prisma.psaEquipment.findUnique({
    where: { id: equipId },
    include: {
      site: true,
      maintenances: { orderBy: { dateMaintenance: "desc" } },
      piecesBesoins: { orderBy: { urgence: "desc" } },
    },
  });
  if (!equip) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(equip);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ equipId: string }> }
) {
  const { equipId } = await params;
  const body = await req.json();
  const equip = await prisma.psaEquipment.update({
    where: { id: equipId },
    data: body,
  });
  return NextResponse.json(equip);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ equipId: string }> }
) {
  const { equipId } = await params;
  await prisma.psaEquipment.delete({ where: { id: equipId } });
  return NextResponse.json({ ok: true });
}
