import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ equipId: string }> }
) {
  const { equipId } = await params;
  const rows = await prisma.psaPieceNeed.findMany({
    where: { equipementId: equipId },
    orderBy: { urgence: "desc" },
  });
  return NextResponse.json(rows);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ equipId: string }> }
) {
  const { equipId } = await params;
  const body = await req.json();
  const row = await prisma.psaPieceNeed.create({
    data: {
      ...body,
      equipementId: equipId,
      quantite: parseInt(body.quantite) || 1,
      prixUnitaire: body.prixUnitaire ? parseFloat(body.prixUnitaire) : null,
    },
  });
  return NextResponse.json(row, { status: 201 });
}
