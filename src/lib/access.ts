import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { canWriteData, isAdminRole } from "@/lib/rbac";

export function assertWritableRole(role?: Role | null) {
  return canWriteData(role);
}

export async function canReadProject(userId: string, role: Role, projectId: string) {
  if (isAdminRole(role) || role === Role.PROJECT_MANAGER || role === Role.TECHNICIAN) {
    return true;
  }

  if (role !== Role.CLIENT) return false;

  const link = await prisma.projectClient.findFirst({
    where: {
      projectId,
      client: {
        users: {
          some: {
            userId,
          },
        },
      },
    },
    select: { id: true },
  });

  return Boolean(link);
}
