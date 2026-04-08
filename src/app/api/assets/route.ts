import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  const assets = await prisma.asset.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { workOrders: true } },
    },
  });

  return NextResponse.json(assets);
}
