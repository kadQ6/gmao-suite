"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type NavItem = {
  href: string;
  label: string;
  sub?: { href: string; label: string }[];
};

const nav: NavItem[] = [
  { href: "/", label: "Accueil" },
  {
    href: "/references",
    label: "Nos missions",
    sub: [
      { href: "/references#france", label: "France" },
      { href: "/references#international", label: "International" },
    ],
  },
  {
    href: "/services",
    label: "Nos activites",
    sub: [
      { href: "/services#conseil-biomedical", label: "Ingenierie biomedicale" },
      { href: "/services#architecture", label: "Architecture hospitaliere" },
    ],
  },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 lg:px-6">

        {/* Logo image */}
        <Link href="/" aria-label="K'BIO - Accueil" className="shrink-0">
          <Image
            src="/brand/logo-kbio.png"
            alt="K'BIO"
            width={110}
            height={38}
            className="h-9 w-auto"
            priority
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 text-sm font-medium text-slate-700 md:flex">
          {nav.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            if (item.sub) {
              return (
                <div key={item.href} className="group relative">
                  <Link
                    href={item.href}
                    className={`relative flex items-center gap-1 rounded-md px-3 py-2 transition hover:text-kbio-teal ${
                      active ? "text-kbio-teal" : ""
                    }`}
                  >
                    {item.label}
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 12 12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="transition-transform duration-200 group-hover:rotate-180"
                    >
                      <path d="M2 4l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {active ? (
                      <span className="absolute -bottom-1.5 left-3 right-3 h-0.5 rounded-full bg-kbio-teal" />
                    ) : null}
                  </Link>
                  <div className="invisible absolute left-0 top-[calc(100%+4px)] z-50 min-w-[200px] translate-y-1 rounded-xl border border-slate-200 bg-white py-1.5 opacity-0 shadow-xl transition-all duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                    {item.sub.map((sub) => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-kbio-surface hover:text-kbio-teal"
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative rounded-md px-3 py-2 transition hover:text-kbio-teal ${
                  active ? "text-kbio-teal" : ""
                }`}
              >
                {item.label}
                {active ? (
                  <span className="absolute -bottom-1.5 left-3 right-3 h-0.5 rounded-full bg-kbio-teal" />
                ) : null}
              </Link>
            );
          })}
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-700 md:hidden"
          aria-label="Menu"
          aria-expanded={mobileOpen}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            {mobileOpen ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen ? (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-0.5 px-4 py-4">
            {nav.map((item) => (
              <div key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-kbio-teal"
                >
                  {item.label}
                </Link>
                {item.sub ? (
                  <div className="mb-1 ml-4 flex flex-col gap-0.5 border-l border-slate-100 pl-3">
                    {item.sub.map((sub) => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        onClick={() => setMobileOpen(false)}
                        className="block rounded-lg px-3 py-2 text-sm text-slate-500 hover:text-kbio-teal"
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
