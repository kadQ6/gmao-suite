"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { clsx } from "clsx";

const items = [
  { href: "/portal/client", label: "Vue d'ensemble" },
  { href: "/portal/projects", label: "Suivi de projet" },
  { href: "/portal/assets", label: "Parc equipements (projets)" },
  { href: "/portal/work-orders", label: "Ordres de travail" },
  { href: "/portal/gmao-biomed", label: "GMAO biomedicale" },
] as const;

export function PortalClientMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const insideClient =
    pathname.startsWith("/portal/client") ||
    pathname.startsWith("/portal/projects") ||
    pathname.startsWith("/portal/assets") ||
    pathname.startsWith("/portal/work-orders") ||
    pathname.startsWith("/portal/gmao-biomed");

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className={clsx(
          "inline-flex items-center gap-1 rounded-md px-1 py-0.5 text-sm font-medium transition",
          insideClient ? "text-kbio-navy" : "text-slate-700 hover:text-kbio-navy",
        )}
      >
        Espace client
        <ChevronDown className={clsx("h-4 w-4 transition", open && "rotate-180")} aria-hidden />
      </button>
      {open ? (
        <div
          className="absolute left-0 top-full z-50 mt-1 min-w-[14rem] rounded-lg border border-slate-200 bg-white py-1 shadow-lg lg:left-auto lg:right-0"
          role="menu"
        >
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              role="menuitem"
              className={clsx(
                "block px-4 py-2.5 text-sm transition hover:bg-slate-50",
                pathname === item.href || (item.href !== "/portal/client" && pathname.startsWith(item.href))
                  ? "font-semibold text-kbio-teal"
                  : "text-slate-700",
              )}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
