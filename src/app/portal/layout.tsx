import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portail client",
};

const navItems = [
  { href: "/portal", label: "Tableau de bord" },
  { href: "/portal/projects", label: "Projets" },
  { href: "/portal/tasks", label: "Taches" },
  { href: "/portal/assets", label: "Equipements" },
  { href: "/portal/work-orders", label: "Ordres de travail" },
  { href: "/portal/admin", label: "Admin" },
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm font-semibold text-kbio-navy">
              K&apos;BIO
            </Link>
            <span className="text-slate-300">|</span>
            <span className="text-sm font-medium text-slate-600">Portail client</span>
          </div>
          <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-slate-600 transition hover:text-kbio-navy"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">{children}</main>
    </>
  );
}
