import Link from "next/link";
import Image from "next/image";

function IconLinkedIn() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function IconFacebook() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

const nav = [
  {
    label: "Explorer",
    links: [
      { href: "/", label: "Accueil" },
      { href: "/references", label: "Nos missions" },
      { href: "/services", label: "Nos activités" },
      { href: "/actualites", label: "Actualités" },
      { href: "/a-propos", label: "À propos" },
    ],
  },
  {
    label: "Missions",
    links: [
      { href: "/references#france", label: "Projets France" },
      { href: "/references#international", label: "Projets internationaux" },
      { href: "/services#conseil-biomedical", label: "Ingénierie biomédicale" },
      { href: "/services#architecture", label: "Architecture hospitalière" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-[#011e38]">

      {/* Subtle grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Top CTA band */}
      <div className="relative border-b border-white/8">
        <div className="mx-auto max-w-6xl px-4 py-12 lg:px-6">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-kbio-teal-light">
                Parlons de votre projet
              </p>
              <h2 className="mt-2 text-2xl font-bold text-white">
                Un projet hospitalier ? Contactez-nous.
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Audit, AMO, programmation — nous répondons sous 24 h.
              </p>
            </div>
            <Link
              href="/contact"
              className="shrink-0 rounded-full bg-kbio-teal px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-kbio-teal/20 transition hover:bg-[#0ea5c9] hover:shadow-kbio-teal/30"
            >
              Nous écrire →
            </Link>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="relative mx-auto max-w-6xl px-4 py-14 lg:px-6">
        <div className="grid gap-12 lg:grid-cols-[2fr,1fr,1fr,1.2fr]">

          {/* Brand */}
          <div className="flex flex-col gap-6">
            <Image
              src="/brand/logo-kbio.png"
              alt="K'BIO"
              width={120}
              height={40}
              style={{ height: "40px", width: "auto" }}
              className="brightness-0 invert"
            />
            <p className="max-w-xs text-sm leading-relaxed text-slate-400">
              Cabinet de conseil indépendant spécialisé en ingénierie biomédicale
              et architecture hospitalière, actif en France et à l&apos;international.
            </p>
            <div className="flex items-center gap-2">
              <a
                href="https://www.linkedin.com/company/kbio-conseil"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn K'BIO"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-slate-400 ring-1 ring-white/10 transition hover:bg-[#0077b5] hover:text-white hover:ring-[#0077b5]"
              >
                <IconLinkedIn />
              </a>
              <a
                href="https://www.facebook.com/kbioconseil"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook K'BIO"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-slate-400 ring-1 ring-white/10 transition hover:bg-[#1877f2] hover:text-white hover:ring-[#1877f2]"
              >
                <IconFacebook />
              </a>
            </div>
          </div>

          {/* Nav columns */}
          {nav.map((col) => (
            <div key={col.label}>
              <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-kbio-teal">
                {col.label}
              </p>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group flex items-center gap-1.5 text-sm text-slate-400 transition hover:text-white"
                    >
                      <span className="h-px w-3 bg-white/20 transition group-hover:w-4 group-hover:bg-kbio-teal" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div>
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-kbio-teal">
              Contact
            </p>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="mailto:contact@kbio-conseil.com"
                  className="flex items-center gap-2 text-slate-300 transition hover:text-white"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0 text-kbio-teal/60">
                    <path d="M3 4a2 2 0 00-2 2v.01L10 11l9-4.99V6a2 2 0 00-2-2H3zm16 3.384-9 4.99-9-4.99V14a2 2 0 002 2h14a2 2 0 002-2V7.384z" />
                  </svg>
                  contact@kbio-conseil.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+33769123558"
                  className="flex items-center gap-2 text-slate-300 transition hover:text-white"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0 text-kbio-teal/60">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  +33 7 69 12 35 58
                </a>
              </li>
              <li className="flex items-start gap-2 text-slate-400">
                <svg viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-4 w-4 shrink-0 text-kbio-teal/60">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span className="leading-relaxed">
                  114 rue du 1er mai<br />
                  01480 Jassans-Riottier<br />
                  <span className="mt-0.5 inline-block text-xs text-slate-500">France · Djibouti</span>
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative border-t border-white/8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-slate-500 sm:flex-row lg:px-6">
          <p>&copy; {new Date().getFullYear()} K&apos;BIO sas — Tous droits réservés.</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Site opérationnel
            </span>
            <span className="text-slate-600">·</span>
            <span>kbio-conseil.com</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
