import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  const tasks = await prisma.task.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      assignee: { select: { id: true, name: true, email: true } },
      project: { select: { id: true, name: true, code: true } },
    },
  });

  return NextResponse.json(tasks);
}
