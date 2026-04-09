import { Role } from "@prisma/client";

export const ADMIN_ROLES: Role[] = [Role.SUPER_ADMIN, Role.ADMIN];
export const INTERNAL_ROLES: Role[] = [Role.SUPER_ADMIN, Role.ADMIN, Role.PROJECT_MANAGER, Role.TECHNICIAN];

export function isAdminRole(role?: Role | null) {
  if (!role) return false;
  return ADMIN_ROLES.includes(role);
}

export function isInternalRole(role?: Role | null) {
  if (!role) return false;
  return INTERNAL_ROLES.includes(role);
}

export function isClientRole(role?: Role | null) {
  return role === Role.CLIENT;
}

export function canWriteData(role?: Role | null) {
  return isInternalRole(role);
}
