import Link from "next/link";
import { PortalPrimaryLink } from "@/components/portal/portal-primary-link";
import { ProjectGallery } from "@/components/portal/project-gallery";
import { ProjectsTable } from "@/components/portal/projects-table";
import { getPortalContext, getProjectScopeWhere } from "@/lib/portal-scope";
import { getPortalWorkspaceSubtitle } from "@/lib/portal-workspace";
import { prisma } from "@/lib/prisma";
import type { Decimal } from "@prisma/client/runtime/library";
import { ProjectPracticeArea, Role } from "@prisma/client";
import { clsx } from "clsx";

export const dynamic = "force-dynamic";

type PageProps = { searchParams: Promise<{ err?: string; deleted?: string; view?: string }> };

type View = "gallery" | "list" | "timeline" | "calendar";

function normalizeView(raw: string | undefined): View {
  if (raw === "list" || raw === "timeline" || raw === "calendar") return raw;
  return "gallery";
}

export default async function ProjectsPage({ searchParams }: PageProps) {
  const ctx = await getPortalContext();
  const sp = await searchParams;
  const view = normalizeView(sp.view);
  const where = getProjectScopeWhere(ctx);
  const subtitle = await getPortalWorkspaceSubtitle(ctx);

  let projects: Array<{
    id: string;
    code: string;
    name: string;
    type: string | null;
    startDate: Date | null;
    endDate: Date | null;
    budgetEstimate: Decimal | null;
    coverImageUrl: string | null;
    practiceArea: ProjectPracticeArea | null;
    owner: { name: string };
    _count: { tasks: number };
  }> = [];

  try {
    projects = await prisma.project.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        owner: { select: { name: true } },
        _count: { select: { tasks: true } },
      },
    });
  } catch {
    projects = [];
  }

  const tabClass = (v: View) =>
    clsx(
      "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition",
      view === v
        ? "bg-slate-800 text-white ring-1 ring-slate-600"
        : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200",
    );

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-8 text-slate-100 shadow-xl shadow-black/30 lg:px-8">
        {sp.deleted === "1" ? (
          <p className="mb-4 rounded-lg border border-emerald-800/60 bg-emerald-950/40 px-3 py-2 text-sm text-emerald-200">
            Projet supprimé. Les fiches client orphelines ont été retirées pour libérer le nom et le code sur une
            nouvelle création.
          </p>
        ) : null}
        {sp.err === "delete-failed" ? (
          <p className="mb-4 rounded-lg border border-red-900/60 bg-red-950/40 px-3 py-2 text-sm text-red-200">
            La suppression a échoué (données liées). Contactez un administrateur ou réessayez.
          </p>
        ) : null}

        <header className="flex flex-col gap-4 border-b border-slate-800/80 pb-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">Projets</h1>
            <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
            {ctx.role === Role.CLIENT ? (
              <p className="mt-3 max-w-2xl text-xs leading-relaxed text-slate-500">
                La base <strong className="font-medium text-slate-400">GMAO biomédicale</strong> est tenue à jour par
                K&apos;BIO. Vous consultez ici vos <strong className="font-medium text-slate-400">projets</strong> et
                le suivi opérationnel (tâches, équipements visibles, ordres de travail). Accès GMAO :{" "}
                <Link href="/portal/gmao-biomed" className="text-sky-400 hover:underline">
                  module intégré
                </Link>
                .
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/api/exports/projects"
              className="rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
            >
              Exporter (.csv)
            </Link>
            <Link
              href="/portal/gmao-biomed"
              className="rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
            >
              GMAO biomedical
            </Link>
            {ctx.canWrite ? <PortalPrimaryLink href="/portal/projects/new">Nouveau</PortalPrimaryLink> : null}
          </div>
        </header>

        <div className="flex flex-col gap-4 border-b border-slate-800/80 py-4 sm:flex-row sm:items-center sm:justify-between">
          <nav className="flex flex-wrap items-center gap-1">
            <Link href="/portal/projects?view=gallery" className={tabClass("gallery")}>
              <span className="opacity-70">▦</span> Galerie
            </Link>
            <Link href="/portal/projects?view=list" className={tabClass("list")}>
              Liste
            </Link>
            <Link href="/portal/projects?view=timeline" className={tabClass("timeline")}>
              Timeline projets
            </Link>
            <Link href="/portal/projects?view=calendar" className={tabClass("calendar")}>
              Calendrier
            </Link>
          </nav>
          <p className="text-xs text-slate-500">Filtres avancés · bientôt</p>
        </div>

        <div className="pt-6">
          {view === "gallery" ? (
            <ProjectGallery
              canWrite={ctx.canWrite}
              projects={projects.map((p) => ({
                id: p.id,
                code: p.code,
                name: p.name,
                startDate: p.startDate,
                endDate: p.endDate,
                budgetEstimate: p.budgetEstimate,
                coverImageUrl: p.coverImageUrl,
                practiceArea: p.practiceArea,
                type: p.type,
              }))}
            />
          ) : null}

          {view === "list" ? <ProjectsTable projects={projects} canWrite={ctx.canWrite} /> : null}

          {view === "timeline" ? (
            <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/50 px-6 py-16 text-center text-sm text-slate-400">
              Vue <strong className="text-slate-300">Timeline</strong> : jalons et phases par projet — en cours de
              conception (équivalent de votre vue Notion).
            </div>
          ) : null}

          {view === "calendar" ? (
            <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/50 px-6 py-16 text-center text-sm text-slate-400">
              Vue <strong className="text-slate-300">Calendrier</strong> : échéances projets et interventions — à
              brancher sur les dates de projet et les tâches.
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
