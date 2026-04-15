import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ equipId: string }> }
) {
  const { equipId } = await params;
  const rows = await prisma.psaAction.findMany({
    where: { equipementId: equipId },
    orderBy: [{ statut: "asc" }, { priorite: "asc" }],
  });
  return NextResponse.json(rows);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ equipId: string }> }
) {
  const { equipId } = await params;
  const body = await req.json();
  const row = await prisma.psaAction.create({
    data: {
      ...body,
      equipementId: equipId,
      coutEstime: body.coutEstime ? parseFloat(body.coutEstime) : null,
      echeance: body.echeance ? new Date(body.echeance) : null,
    },
  });
  return NextResponse.json(row, { status: 201 });
}
