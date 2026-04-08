import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

/** Liste legere des utilisateurs pour assignation (taches, OT). */
export async function GET() {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  const users = await prisma.user.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true },
  });

  return NextResponse.json(users);
}
