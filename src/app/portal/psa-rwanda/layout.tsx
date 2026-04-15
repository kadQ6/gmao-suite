import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canReadBiomed } from "@/lib/biomed/rbac";

export const metadata = { title: "PSA Rwanda — Audit" };

const NAV = [
  { href: "/portal/psa-rwanda", label: "Vue d'ensemble" },
  { href: "/portal/psa-rwanda/dashboard", label: "Dashboard" },
];

export default async function PsaRwandaLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?callbackUrl=/portal/psa-rwanda");
  if (!canReadBiomed(session.user.role)) redirect("/portal");

  const isAdmin = session.user.role === "SUPER_ADMIN" || session.user.role === "ADMIN";

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <nav className="text-xs text-slate-500 mb-1">
            <Link href="/portal" className="hover:text-kbio-navy">Portail</Link>
            <span className="mx-2">/</span>
            <span className="font-medium text-slate-700">PSA Rwanda — Audit</span>
          </nav>
          <h1 className="text-2xl font-bold text-kbio-navy flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-kbio-navy text-white text-sm font-bold">O₂</span>
            PSA Rwanda — Audit des 3 sites
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 border border-amber-200">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Mode Admin
            </span>
          )}
          {!isAdmin && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 border border-slate-200">
              <span className="h-2 w-2 rounded-full bg-slate-400" />
              Lecture seule
            </span>
          )}
        </div>
      </div>

      {/* Sub-nav */}
      <nav className="flex gap-1 border-b border-slate-200 pb-px">
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-kbio-navy rounded-t-lg hover:bg-slate-50 transition-colors"
          >
            {n.label}
          </Link>
        ))}
      </nav>

      {children}
    </div>
  );
}
