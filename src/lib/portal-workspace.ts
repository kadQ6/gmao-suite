import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type Ctx = { userId: string; role: Role };

/**
 * Sous-titre type capture Notion : "K'BIO — {Client}" pour les comptes client.
 */
export async function getPortalWorkspaceSubtitle(ctx: Ctx): Promise<string> {
  if (ctx.role !== Role.CLIENT || !ctx.userId) {
    return "K'BIO Conseil";
  }
  const links = await prisma.clientUser.findMany({
    where: { userId: ctx.userId },
    include: { client: { select: { name: true } } },
    orderBy: { createdAt: "asc" },
  });
  if (links.length === 0) return "Espace client";
  const names = links.map((l) => l.client.name);
  return `K'BIO — ${names.join(" · ")}`;
}
