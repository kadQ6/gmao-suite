import { PsaEquipmentStatus } from "@prisma/client";

export function statusColor(statut: PsaEquipmentStatus): string {
  switch (statut) {
    case "FONCTIONNEL":
      return "bg-emerald-100 text-emerald-800 border-emerald-300";
    case "EN_PANNE":
      return "bg-red-100 text-red-800 border-red-300";
    case "EN_ATTENTE":
      return "bg-gray-200 text-gray-600 border-gray-300";
    case "HORS_SERVICE":
      return "bg-red-200 text-red-900 border-red-400";
    default:
      return "bg-slate-100 text-slate-700 border-slate-300";
  }
}

export function statusDot(statut: PsaEquipmentStatus): string {
  switch (statut) {
    case "FONCTIONNEL":
      return "bg-emerald-500";
    case "EN_PANNE":
      return "bg-red-500";
    case "EN_ATTENTE":
      return "bg-gray-400";
    case "HORS_SERVICE":
      return "bg-red-700";
    default:
      return "bg-slate-400";
  }
}

export function statusLabel(statut: PsaEquipmentStatus): string {
  switch (statut) {
    case "FONCTIONNEL":
      return "Fonctionnel";
    case "EN_PANNE":
      return "En panne";
    case "EN_ATTENTE":
      return "En attente";
    case "HORS_SERVICE":
      return "Hors service";
    default:
      return statut;
  }
}

export function statusRowBg(statut: PsaEquipmentStatus): string {
  switch (statut) {
    case "FONCTIONNEL":
      return "bg-emerald-50/40 hover:bg-emerald-50";
    case "EN_PANNE":
      return "bg-red-50/50 hover:bg-red-50";
    case "EN_ATTENTE":
      return "bg-gray-50/60 hover:bg-gray-100";
    case "HORS_SERVICE":
      return "bg-red-100/30 hover:bg-red-100";
    default:
      return "hover:bg-slate-50";
  }
}

export function formatEur(val: number | null | undefined): string {
  if (val == null) return "—";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(val);
}

export function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const dt = typeof d === "string" ? new Date(d) : d;
  return dt.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
