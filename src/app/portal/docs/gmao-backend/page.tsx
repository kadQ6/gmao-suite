import type { Metadata } from "next";
import Link from "next/link";
import { GmaoBackendSpecContent } from "@/components/portal/docs/gmao-backend-spec-content";

export const metadata: Metadata = {
  title: "Specification backend GMAO | Documentation",
  description: "SPEC-GMAO-BACKEND v1.0 — synthese stack, tables, API, jobs et MVP.",
};

const toc = [
  { href: "#stack-be", label: "Stack" },
  { href: "#modules-be", label: "Modules" },
  { href: "#tables-be", label: "Tables" },
  { href: "#numerotation-be", label: "Numerotation" },
  { href: "#regles-be", label: "Regles metier" },
  { href: "#api-be", label: "API MVP" },
  { href: "#jobs-be", label: "Jobs" },
  { href: "#mvp-be", label: "Phases MVP" },
] as const;

export default function GmaoBackendSpecPage() {
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
        <GmaoBackendSpecContent />
      </article>
    </div>
  );
}
