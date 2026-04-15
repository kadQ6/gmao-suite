import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const sites = await prisma.psaSite.findMany({
    orderBy: { code: "asc" },
    include: {
      equipements: {
        select: {
          id: true,
          statut: true,
          piecesBesoins: {
            select: { quantite: true, prixUnitaire: true },
          },
        },
      },
    },
  });
  return NextResponse.json(sites);
}

export async function POST(req: Request) {
  const body = await req.json();
  const site = await prisma.psaSite.create({ data: body });
  return NextResponse.json(site, { status: 201 });
}
