import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ equipId: string }> }
) {
  const { equipId } = await params;
  const rows = await prisma.psaMaintenance.findMany({
    where: { equipementId: equipId },
    orderBy: { dateMaintenance: "desc" },
  });
  return NextResponse.json(rows);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ equipId: string }> }
) {
  const { equipId } = await params;
  const body = await req.json();
  const row = await prisma.psaMaintenance.create({
    data: {
      ...body,
      equipementId: equipId,
      dateMaintenance: new Date(body.dateMaintenance),
      dureeHeures: body.dureeHeures ? parseFloat(body.dureeHeures) : null,
      coutTotal: body.coutTotal ? parseFloat(body.coutTotal) : null,
    },
  });
  return NextResponse.json(row, { status: 201 });
}
