import Link from "next/link";

type NavItem = {
  href: string;
  label: string;
};

const mainNav: NavItem[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/projects", label: "Projects" },
  { href: "/equipment", label: "GMAO / Equipment" },
  { href: "/actions", label: "Project Tracking" },
  { href: "/settings", label: "Settings" },
];

const adminNav: NavItem[] = [
  { href: "/admin", label: "Admin Home" },
  { href: "/admin/clients", label: "Clients" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/documents", label: "Documents" },
];

export function PlatformShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[260px_1fr] lg:px-6">
        <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <Link href="/dashboard" className="block rounded-lg px-3 py-2 text-sm font-semibold text-kbio-navy">
            K'BIO Platform
          </Link>
          <p className="mt-1 px-3 text-xs text-slate-500">Client portal and internal operations</p>

          <div className="mt-4 space-y-1">
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-lg px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="mt-6 border-t border-slate-200 pt-4">
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Admin</p>
            <div className="mt-2 space-y-1">
              {adminNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-lg px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        <section className="space-y-4">{children}</section>
      </div>
    </div>
  );
}

export function PlatformPage({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-kbio-navy">{title}</h1>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
      {children ? <div className="mt-6">{children}</div> : null}
    </div>
  );
}
