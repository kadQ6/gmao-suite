import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  const workOrders = await prisma.workOrder.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      asset: { select: { id: true, code: true, name: true } },
      assignee: { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json(workOrders);
}
