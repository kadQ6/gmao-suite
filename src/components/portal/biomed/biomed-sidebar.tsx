"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Beaker,
  Building2,
  CalendarDays,
  ChartBar,
  ChevronDown,
  ClipboardList,
  Cog,
  Home,
  Package,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { clsx } from "clsx";

const base = "/portal/gmao-biomed";

type NavGroup = { type: "group"; label: string; icon: LucideIcon; children: { href: string; label: string }[] };
type NavLeaf = {
  type: "leaf";
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  needReports?: boolean;
  needAdmin?: boolean;
};

const NAV: Array<NavGroup | NavLeaf> = [
  { type: "leaf", href: base, label: "Tableau de bord", icon: Home, exact: true },
  { type: "leaf", href: `${base}/equipements`, label: "Parc equipements", icon: Wrench },
  {
    type: "group",
    label: "Maintenance",
    icon: CalendarDays,
    children: [
      { href: `${base}/interventions`, label: "Demandes d'intervention" },
      { href: `${base}/maintenance/preventive`, label: "Preventive (MP)" },
      { href: `${base}/maintenance/curative`, label: "Curative (MC)" },
      { href: `${base}/controles-qualite`, label: "Controles qualite" },
      { href: `${base}/protocoles`, label: "Protocoles" },
    ],
  },
  {
    type: "group",
    label: "Stock & Achats",
    icon: Package,
    children: [
      { href: `${base}/stock/pieces`, label: "Pieces detachees" },
      { href: `${base}/stock`, label: "Mouvements stock" },
      { href: `${base}/achats`, label: "Achats / DA" },
    ],
  },
  { type: "leaf", href: `${base}/techniciens`, label: "Techniciens", icon: Users },
  { type: "leaf", href: `${base}/sites`, label: "Sites & locaux", icon: Building2 },
  {
    type: "group",
    label: "Patrimoine",
    icon: ClipboardList,
    children: [
      { href: `${base}/immobilisations`, label: "Immobilisation / Reforme" },
      { href: `${base}/plan-investissement`, label: "Plan d'investissement" },
    ],
  },
  {
    type: "leaf",
    href: `${base}/rapports`,
    label: "Rapports & exports",
    icon: ChartBar,
    needReports: true,
  },
  {
    type: "leaf",
    href: `${base}/administration`,
    label: "Administration",
    icon: Cog,
    needAdmin: true,
  },
];

type Props = {
  showReports: boolean;
  showAdmin: boolean;
};

function matches(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function BiomedSidebar({ showReports, showAdmin }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const visible = (item: NavLeaf) => {
    if (item.needAdmin && !showAdmin) return false;
    if (item.needReports && !showReports) return false;
    return true;
  };

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center gap-3 border-b border-slate-200 bg-kbio-navy px-4 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
          <Beaker className="h-5 w-5 text-white" aria-hidden />
        </div>
        <div>
          <p className="text-sm font-bold leading-tight text-white">GMAO Biomedicale</p>
          <p className="text-xs text-teal-200/90">Integree au portail</p>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3 text-sm">
        {NAV.map((item, i) => {
          if (item.type === "group") {
            const key = `g-${i}`;
            const isOpen = open[key] ?? item.children.some((c) => pathname.startsWith(c.href));
            const childActive = item.children.some((c) => pathname.startsWith(c.href));
            return (
              <div key={key}>
                <button
                  type="button"
                  onClick={() => setOpen((s) => ({ ...s, [key]: !isOpen }))}
                  className={clsx(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2.5 font-medium transition-colors",
                    childActive ? "text-kbio-navy" : "text-slate-600 hover:bg-slate-50",
                  )}
                >
                  <span className="flex items-center gap-3">
                    <item.icon className="h-5 w-5 shrink-0 opacity-80" aria-hidden />
                    {item.label}
                  </span>
                  <ChevronDown className={clsx("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
                </button>
                {isOpen ? (
                  <div className="ml-2 mt-0.5 space-y-0.5 border-l-2 border-slate-200 py-1 pl-3">
                    {item.children.map((c) => (
                      <Link
                        key={c.href}
                        href={c.href}
                        className={clsx(
                          "block rounded-md px-2 py-2 transition-colors",
                          pathname.startsWith(c.href)
                            ? "bg-teal-50 font-semibold text-kbio-teal"
                            : "text-slate-600 hover:bg-slate-50",
                        )}
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          }
          if (!visible(item)) return null;
          const active = matches(pathname, item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium transition-colors",
                active ? "bg-teal-50 text-kbio-teal" : "text-slate-600 hover:bg-slate-50",
              )}
            >
              <item.icon className="h-5 w-5 shrink-0 opacity-80" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-200 px-4 py-3 text-xs text-slate-500">
        <Link href="/portal/client" className="font-medium text-kbio-teal hover:underline">
          Retour espace client
        </Link>
        <span className="mt-1 block text-slate-400">Module biomedical v1</span>
      </div>
    </aside>
  );
}
