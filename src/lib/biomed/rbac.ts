import { Role } from "@prisma/client";

export function canReadBiomed(role: Role | undefined): boolean {
  return role != null;
}

/** Creation / modification (clients portail en lecture seule) */
export function canWriteBiomed(role: Role | undefined): boolean {
  if (!role) return false;
  return role !== Role.CLIENT;
}

/** Rapports & exports (pilotage — equipe direction / PM) */
export function canAccessBiomedReports(role: Role | undefined): boolean {
  if (!role) return false;
  return role === Role.SUPER_ADMIN || role === Role.ADMIN || role === Role.PROJECT_MANAGER;
}

export function canAccessBiomedAdmin(role: Role | undefined): boolean {
  if (!role) return false;
  return role === Role.SUPER_ADMIN || role === Role.ADMIN;
}
