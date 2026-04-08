import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 lg:grid-cols-3 lg:px-6">
        <div>
          <p className="text-lg font-semibold text-kbio-navy">K&apos;BIO Group</p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-600">
            Ingenierie biomedicale, architecture hospitaliere et solutions digitales pour les systemes de
            sante en Afrique et au-dela.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">Navigation</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>
              <Link href="/a-propos" className="hover:text-kbio-navy">
                A propos
              </Link>
            </li>
            <li>
              <Link href="/services" className="hover:text-kbio-navy">
                Services
              </Link>
            </li>
            <li>
              <Link href="/references" className="hover:text-kbio-navy">
                References
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-kbio-navy">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-kbio-navy">
                Portail client
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">Coordonnees</p>
          <p className="mt-3 text-sm text-slate-600">
            Ecrivez-nous via le formulaire{" "}
            <Link href="/contact" className="font-medium text-kbio-teal hover:underline">
              Contact
            </Link>
            .
          </p>
          <p className="mt-4 text-xs text-slate-400">
            Les chiffres et logos institutionnels sur ce site sont presentes a titre illustratif jusqu&apos;a
            validation finale du contenu.
          </p>
        </div>
      </div>
      <div className="border-t border-slate-100 py-6 text-center text-xs text-slate-400">
        {new Date().getFullYear()} K&apos;BIO Group. Tous droits reserves.
      </div>
    </footer>
  );
}
