import type { Metadata } from "next";
import Link from "next/link";
import { GmaoFrontendSpecContent } from "@/components/portal/docs/gmao-frontend-spec-content";

export const metadata: Metadata = {
  title: "Specification frontend GMAO | Documentation",
  description: "SPEC-GMAO-FRONTEND v1.0 — stack, architecture, pages, UX, MVP et roadmap.",
};

const toc = [
  { href: "#stack", label: "Stack frontend" },
  { href: "#architecture", label: "Architecture" },
  { href: "#layout", label: "Layout global" },
  { href: "#pages", label: "Pages principales" },
  { href: "#composants", label: "Composants UI" },
  { href: "#ux", label: "UX metier" },
  { href: "#workflows", label: "Workflows" },
  { href: "#etat", label: "Etats" },
  { href: "#formulaires", label: "Formulaires" },
  { href: "#tableaux", label: "Tableaux" },
  { href: "#dashboard-kpi", label: "Dashboard" },
  { href: "#responsive", label: "Responsive" },
  { href: "#securite", label: "Securite" },
  { href: "#mvp", label: "MVP" },
  { href: "#roadmap", label: "Roadmap" },
] as const;

export default function GmaoFrontendSpecPage() {
  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
      <aside className="shrink-0 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:w-52 lg:overflow-y-auto">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Sommaire</p>
        <ul className="space-y-2">
          {toc.map((t) => (
            <li key={t.href}>
              <a href={t.href} className="text-kbio-teal hover:underline">
                {t.label}
              </a>
            </li>
          ))}
        </ul>
        <Link
          href="/portal/docs"
          className="mt-6 inline-block text-xs font-medium text-slate-600 hover:text-kbio-navy hover:underline"
        >
          ← Toute la documentation
        </Link>
      </aside>
      <article className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:p-10">
        <GmaoFrontendSpecContent />
      </article>
    </div>
  );
}
