import Image from "next/image";
import Link from "next/link";
import { Briefcase } from "lucide-react";
import type { Decimal } from "@prisma/client/runtime/library";
import type { ProjectPracticeArea } from "@prisma/client";
import { practiceAreaBadgeClass, practiceAreaLabel } from "@/lib/project-practice-area";

export type ProjectGalleryItem = {
  id: string;
  code: string;
  name: string;
  startDate: Date | null;
  endDate: Date | null;
  budgetEstimate: Decimal | null;
  coverImageUrl: string | null;
  practiceArea: ProjectPracticeArea | null;
  type: string | null;
};

function formatDateRange(start: Date | null, end: Date | null) {
  const fmt = (d: Date) =>
    d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
  if (start && end) return `${fmt(start)} → ${fmt(end)}`;
  if (start) return fmt(start);
  if (end) return fmt(end);
  return "—";
}

function formatBudget(v: Decimal | null) {
  if (v == null) return null;
  const n = Number(v);
  return n.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

export function ProjectGallery({
  projects,
  canWrite,
}: {
  projects: ProjectGalleryItem[];
  canWrite: boolean;
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {projects.map((p) => {
        const tag = practiceAreaLabel(p.practiceArea);
        const budget = formatBudget(p.budgetEstimate);
        const img = p.coverImageUrl;
        return (
          <Link
            key={p.id}
            href={`/portal/projects/${p.id}`}
            className="group flex flex-col overflow-hidden rounded-xl border border-slate-700/80 bg-slate-900/80 shadow-lg shadow-black/20 transition hover:border-slate-500 hover:shadow-xl"
          >
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-800">
              {img ? (
                <Image
                  src={img}
                  alt=""
                  fill
                  className="object-cover transition duration-300 group-hover:scale-[1.03]"
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 text-slate-500">
                  <Briefcase className="h-12 w-12 opacity-40" aria-hidden />
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-2 p-4">
              <h3 className="flex items-start gap-2 font-semibold leading-snug text-white">
                <Briefcase className="mt-0.5 h-4 w-4 shrink-0 text-violet-400" aria-hidden />
                <span className="line-clamp-3">{p.name}</span>
              </h3>
              <p className="text-xs text-slate-400">{formatDateRange(p.startDate, p.endDate)}</p>
              {tag ? (
                <span
                  className={`inline-flex w-fit rounded-md border px-2 py-0.5 text-xs font-medium ${practiceAreaBadgeClass(p.practiceArea)}`}
                >
                  {tag}
                </span>
              ) : p.type ? (
                <span className="inline-flex w-fit rounded-md border border-slate-600/60 bg-slate-800/80 px-2 py-0.5 text-xs text-slate-300">
                  {p.type}
                </span>
              ) : null}
              {budget ? (
                <p className="mt-auto pt-2 text-sm font-semibold tabular-nums text-slate-100">{budget}</p>
              ) : (
                <p className="mt-auto pt-2 text-xs text-slate-500">Budget non renseigné</p>
              )}
            </div>
          </Link>
        );
      })}
      {canWrite ? (
        <Link
          href="/portal/projects/new"
          className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-600 bg-slate-900/40 p-6 text-center transition hover:border-sky-500/50 hover:bg-slate-900/60"
        >
          <span className="text-sm font-medium text-slate-300">Projet template</span>
          <span className="mt-2 text-xs text-slate-500">Créer un nouveau projet portail client</span>
        </Link>
      ) : null}
    </div>
  );
}
