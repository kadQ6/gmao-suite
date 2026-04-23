import Link from "next/link";

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

export function SiteFooter() {
  return (
    <footer className="bg-gradient-to-b from-[#02294d] to-[#001a33] text-slate-200">
      <div className="mx-auto max-w-6xl px-4 py-14 lg:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.4fr,1fr,1fr,1fr]">

          {/* Brand */}
          <div>
            <span className="font-display text-2xl font-bold tracking-tight text-white">
              K&apos;BIO
            </span>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-300">
              Cabinet de conseil en ingénierie biomédicale et architecture hospitalière.
              Accompagnement des établissements de santé, ministères et bailleurs.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href="https://www.linkedin.com/company/kbio-conseil"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn K'BIO"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-slate-300 transition hover:border-kbio-teal hover:bg-kbio-teal hover:text-white"
              >
                <IconLinkedIn />
              </a>
              <a
                href="https://www.facebook.com/kbioconseil"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook K'BIO"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-slate-300 transition hover:border-blue-500 hover:bg-blue-600 hover:text-white"
              >
                <IconFacebook />
              </a>
            </div>
          </div>

          {/* Missions + Activités */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-kbio-teal-light">
              Nos missions
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/references#france" className="text-slate-300 transition hover:text-white">
                  Projets France
                </Link>
              </li>
              <li>
                <Link href="/references#international" className="text-slate-300 transition hover:text-white">
                  Projets internationaux
                </Link>
              </li>
            </ul>
            <p className="mt-7 text-xs font-semibold uppercase tracking-[0.2em] text-kbio-teal-light">
              Nos activités
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/services#conseil-biomedical" className="text-slate-300 transition hover:text-white">
                  Ingénierie biomédicale
                </Link>
              </li>
              <li>
                <Link href="/services#architecture" className="text-slate-300 transition hover:text-white">
                  Architecture hospitalière
                </Link>
              </li>
            </ul>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-kbio-teal-light">
              Navigation
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/" className="text-slate-300 transition hover:text-white">
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/references" className="text-slate-300 transition hover:text-white">
                  Nos missions
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-slate-300 transition hover:text-white">
                  Nos activités
                </Link>
              </li>
              <li>
                <Link href="/actualites" className="text-slate-300 transition hover:text-white">
                  Actualités
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-300 transition hover:text-white">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-kbio-teal-light">
              Contact
            </p>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li>
                <a href="mailto:contact@kbio-conseil.com" className="transition hover:text-white">
                  contact@kbio-conseil.com
                </a>
              </li>
              <li>
                <a href="tel:+33769123558" className="transition hover:text-white">
                  +33 7 69 12 35 58
                </a>
              </li>
              <li className="pt-1 leading-relaxed text-slate-400">
                114 rue du 1er mai<br />
                01480 Jassans-Riottier
              </li>
              <li className="text-slate-400">France &middot; Djibouti</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 text-xs text-slate-400 sm:flex-row sm:items-center">
          <p>&copy; {new Date().getFullYear()} K&apos;BIO sas. Tous droits réservés.</p>
          <p>114 rue du 1er mai, 01480 Jassans-Riottier</p>
        </div>
      </div>
    </footer>
  );
}
