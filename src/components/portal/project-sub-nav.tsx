"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  projectId: string;
};

export function ProjectSubNav({ projectId }: Props) {
  const pathname = usePathname();
  const base = `/portal/projects/${projectId}`;
  const tabs = [
    { href: base, label: "Vue projet", match: (p: string) => p === base },
    { href: `${base}/gmao`, label: "GMAO", match: (p: string) => p.startsWith(`${base}/gmao`) },
    { href: `${base}/tasks`, label: "Taches", match: (p: string) => p.startsWith(`${base}/tasks`) },
    { href: `${base}/assets`, label: "Equipements", match: (p: string) => p.startsWith(`${base}/assets`) },
    {
      href: `${base}/work-orders`,
      label: "Ordres de travail",
      match: (p: string) => p.startsWith(`${base}/work-orders`),
    },
  ];

  return (
    <div className="flex flex-wrap gap-1 border-b border-slate-200">
      {tabs.map((tab) => {
        const active = tab.match(pathname);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`rounded-t-lg px-4 py-2 text-sm font-medium transition ${
              active
                ? "border border-b-0 border-slate-200 bg-white text-kbio-navy"
                : "text-slate-600 hover:bg-slate-50 hover:text-kbio-navy"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
