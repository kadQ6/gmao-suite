import Link from "next/link";

const nav = [
  { href: "/a-propos", label: "A propos" },
  { href: "/services", label: "Services" },
  { href: "/references", label: "References" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-4 lg:px-6">
        <Link href="/" className="group flex items-baseline gap-2">
          <span className="text-lg font-semibold tracking-tight text-kbio-navy">K&apos;BIO</span>
          <span className="hidden text-xs font-medium uppercase tracking-[0.2em] text-slate-500 sm:inline">
            Group
          </span>
        </Link>
        <nav className="flex max-w-[55vw] flex-wrap justify-end gap-x-4 gap-y-1 text-xs font-medium text-slate-600 sm:max-w-none sm:gap-8 sm:text-sm md:flex-1 md:justify-center">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition hover:text-kbio-navy"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-kbio-teal hover:text-kbio-navy sm:px-4 sm:py-2 sm:text-sm"
          >
            Portail
          </Link>
          <Link
            href="/contact"
            className="rounded-full bg-kbio-navy px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-kbio-navy/90"
          >
            Demander une etude
          </Link>
        </div>
      </div>
    </header>
  );
}
