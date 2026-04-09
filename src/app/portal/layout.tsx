import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portail client",
};

const primaryNav = [
  { href: "/portal", label: "Tableau de bord" },
  { href: "/portal/projects", label: "Projets" },
];

const maintenanceNav = [
  { href: "/portal/assets", label: "Equipements" },
  { href: "/portal/work-orders", label: "Ordres de travail" },
];

const adminNav = [{ href: "/portal/admin", label: "Admin" }];

const docsNav = [{ href: "/portal/docs", label: "Documentation technique" }];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 lg:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="text-sm font-semibold text-kbio-navy">
                K&apos;BIO
              </Link>
              <span className="text-slate-300">|</span>
              <span className="text-sm font-medium text-slate-600">Portail client</span>
            </div>
            <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              <span className="hidden text-xs font-semibold uppercase tracking-wide text-slate-400 lg:inline">
                Suivi
              </span>
              {primaryNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="font-medium text-slate-700 transition hover:text-kbio-navy"
                >
                  {item.label}
                </Link>
              ))}
              <span className="hidden text-xs font-semibold uppercase tracking-wide text-slate-400 lg:inline">
                GMAO
              </span>
              {maintenanceNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-slate-600 transition hover:text-kbio-navy"
                >
                  {item.label}
                </Link>
              ))}
              {adminNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-slate-600 transition hover:text-kbio-navy"
                >
                  {item.label}
                </Link>
              ))}
              <span className="hidden text-xs font-semibold uppercase tracking-wide text-slate-400 lg:inline">
                Ressources
              </span>
              {docsNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-slate-600 transition hover:text-kbio-teal"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 lg:px-6">{children}</main>
    </>
  );
}
