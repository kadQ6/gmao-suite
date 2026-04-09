import { Role } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canWriteData } from "@/lib/rbac";

type PortalContext = {
  userId: string;
  role: Role;
  canWrite: boolean;
};

export async function getPortalContext(): Promise<PortalContext> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.role) {
    // Proxy should already block unauthenticated access, keep a safe fallback.
    return { userId: "", role: Role.CLIENT, canWrite: false };
  }

  return {
    userId: session.user.id,
    role: session.user.role,
    canWrite: canWriteData(session.user.role),
  };
}

export function getProjectScopeWhere(ctx: PortalContext): Prisma.ProjectWhereInput {
  if (ctx.role !== Role.CLIENT) return { archivedAt: null };
  return {
    archivedAt: null,
    clients: {
      some: {
        client: {
          users: {
            some: {
              userId: ctx.userId,
            },
          },
        },
      },
    },
  };
}

export function getAssetScopeWhere(ctx: PortalContext): Prisma.AssetWhereInput {
  if (ctx.role !== Role.CLIENT) return { archivedAt: null };
  return {
    archivedAt: null,
    visibleToClient: true,
    project: getProjectScopeWhere(ctx),
  };
}

export function getWorkOrderScopeWhere(ctx: PortalContext): Prisma.WorkOrderWhereInput {
  if (ctx.role !== Role.CLIENT) return {};
  return {
    visibleToClient: true,
    project: getProjectScopeWhere(ctx),
  };
}
