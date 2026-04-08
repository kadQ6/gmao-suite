import { Role } from "@prisma/client";

export const ADMIN_ROLES: Role[] = [Role.SUPER_ADMIN, Role.ADMIN];

export function isAdminRole(role?: Role | null) {
  if (!role) return false;
  return ADMIN_ROLES.includes(role);
}
