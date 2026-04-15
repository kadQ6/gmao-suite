import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ maintenanceId: string }> }
) {
  const { maintenanceId } = await params;
  await prisma.psaMaintenance.delete({ where: { id: maintenanceId } });
  return NextResponse.json({ ok: true });
}
