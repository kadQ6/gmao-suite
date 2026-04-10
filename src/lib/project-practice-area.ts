import { ProjectPracticeArea } from "@prisma/client";

const LABELS: Record<ProjectPracticeArea, string> = {
  BIOMEDICAL_ENGINEERING: "Ingénierie biomédicale",
  HOSPITAL_ARCHITECTURE: "Architecture hospitalière",
  PROJECT_MANAGEMENT: "Gestion de projet",
  OTHER: "Autre",
};

const BADGE: Record<ProjectPracticeArea, string> = {
  BIOMEDICAL_ENGINEERING: "border-sky-500/40 bg-sky-500/20 text-sky-100",
  HOSPITAL_ARCHITECTURE: "border-amber-600/50 bg-amber-900/40 text-amber-100",
  PROJECT_MANAGEMENT: "border-violet-500/40 bg-violet-500/15 text-violet-100",
  OTHER: "border-slate-500/40 bg-slate-600/30 text-slate-200",
};

export function practiceAreaLabel(area: ProjectPracticeArea | null | undefined): string | null {
  if (!area) return null;
  return LABELS[area] ?? null;
}

export function practiceAreaBadgeClass(area: ProjectPracticeArea | null | undefined): string {
  if (!area) return "border-slate-600/50 bg-slate-800/60 text-slate-300";
  return BADGE[area] ?? BADGE.OTHER;
}
