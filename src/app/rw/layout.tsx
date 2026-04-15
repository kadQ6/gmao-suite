import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const metadata = {
  title: { default: "PSA Rwanda — Suivi équipements O₂", template: "%s | PSA Rwanda" },
  description: "Application de suivi des équipements PSA oxygène — Audit Rwanda 2026",
};

async function UserBadge() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const isAdmin = session.user.role === "SUPER_ADMIN" || session.user.role === "ADMIN";
  return (
    <div className="flex items-center gap-3">
      {isAdmin ? (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 border border-amber-200">
          <span className="h-2 w-2 rounded-full bg-amber-500" /> Admin
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 border border-slate-200">
          <span className="h-2 w-2 rounded-full bg-slate-400" /> Lecture seule
        </span>
      )}
      <span className="text-xs text-white/70 hidden sm:inline">{session.user.name}</span>
    </div>
  );
}

export default function RwLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="bg-[#0a2540] text-white shadow-lg">
        <div className="mx-auto max-w-7xl px-4 py-3 lg:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/rw" className="flex items-center gap-2.5 group">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-sm font-bold group-hover:bg-white/20 transition-colors">O₂</span>
                <div className="hidden sm:block">
                  <span className="block text-sm font-bold leading-tight">PSA Rwanda</span>
                  <span className="block text-[10px] text-white/50 leading-tight">Suivi équipements oxygène</span>
                </div>
              </Link>
              <nav className="flex items-center gap-1 ml-4">
                <Link href="/rw" className="px-3 py-1.5 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors">Sites</Link>
                <Link href="/rw/dashboard" className="px-3 py-1.5 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors">Dashboard</Link>
              </nav>
            </div>
            <UserBadge />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 lg:px-6">{children}</main>
      <footer className="border-t border-slate-200 bg-white mt-auto">
        <div className="mx-auto max-w-7xl px-4 py-4 lg:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
            <span>K&apos;BIO Conseil — Ingénierie biomédicale</span>
            <span>PSA Rwanda Audit 2026</span>
          </div>
        </div>
      </footer>
    </>
  );
}
