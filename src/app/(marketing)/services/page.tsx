import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Nos activités",
  description:
    "Ingénierie biomédicale et architecture hospitalière : K'BIO accompagne la conception, l'audit et le déploiement des établissements de santé en France et à l'international.",
};

const services = [
  {
    id: "conseil-biomedical",
    tag: "Ingénierie biomédicale",
    heading: "Conseil et gestion biomédicale",
    intro:
      "Le service biomédical est transversal et fondamental dans les établissements de soins. La gestion adéquate des prestations biomédicales améliore l'offre de soins et réduit les coûts de maintenance.",
    sections: [
      {
        title: "Audit d'organisation et de parc",
        body: "Nous réalisons un état des lieux complet de votre organisation biomédicale : inventaire des équipements, analyse des contrats de maintenance, conformité réglementaire et propositions d'optimisation.",
        items: [
          "Audit d'organisation du service biomédical",
          "Audit et inventaire du parc d'équipements",
          "Analyse des contrats de maintenance",
          "Plan d'investissement pluriannuel",
          "Conformité réglementaire (ANSM, HAS)",
        ],
      },
      {
        title: "Externalisation et mise à disposition",
        body: "K'BIO accompagne les établissements dans l'externalisation complète ou partielle de leur service biomédical. Nous mettons à disposition nos ingénieurs et techniciens qualifiés.",
        items: [
          "Externalisation biomédicale totale ou partielle",
          "Mise à disposition d'ingénieurs et techniciens",
          "Missions ponctuelles et nouvelles techniques médicales",
          "Formation et montée en compétences du personnel",
          "Pilotage de la qualité et reporting aux directions",
        ],
      },
    ],
    image: "/missions/biomedical-pc.webp",
    standards: ["ISO 13485", "IEC 60601", "EN 62353", "NF S99-170"],
    cta: { label: "Nous contacter", href: "/contact" },
  },
  {
    id: "architecture",
    tag: "Architecture hospitalière",
    heading: "Programmation et intégration des équipements",
    intro:
      "Expertise biomédicale dans les projets de conception architecturale hospitalière, de réorganisation, de réaménagement et de déménagement. De la programmation fonctionnelle à la réception des ouvrages.",
    sections: [
      {
        title: "Programmation fonctionnelle et technique",
        body: "Nous intervenons en amont des projets pour définir les besoins fonctionnels, optimiser les flux et intégrer les contraintes techniques des équipements médicaux lourds.",
        items: [
          "Programmation fonctionnelle et technique",
          "Optimisation des flux patients et logistiques",
          "Intégration des équipements critiques (imagerie, blocs, réanimation)",
          "Fluides médicaux et infrastructures associées",
          "Coordination avec la maîtrise d'œuvre",
        ],
      },
      {
        title: "Assistance à maîtrise d'ouvrage (AMO)",
        body: "K'BIO accompagne les maîtres d'ouvrage sur l'ensemble du cycle de vie du projet : cadrage, pilotage des appels d'offres, coordination des fournisseurs et réception des travaux.",
        items: [
          "Cadrage stratégique et budgétaire",
          "Pilotage des appels d'offres",
          "Coordination des fournisseurs et intégrateurs",
          "Validation technique des livrables",
          "Réception et mise en service",
          "Reporting aux institutionnels et bailleurs (AFD, ENABEL, UNICEF)",
        ],
      },
    ],
    image: "/missions/chi-compiegne.webp",
    standards: ["RT 2020", "PMR", "NF S90-351 (salles propres)", "Règles blocs opératoires"],
    cta: { label: "Voir nos missions", href: "/references" },
  },
];

export default function ServicesPage() {
  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-kbio-navy">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url(/missions/medipole.webp)" }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-br from-kbio-navy via-kbio-navy/95 to-[#0a5591]/80" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 py-20 lg:px-6 lg:py-28">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-kbio-teal-light">
            Nos activités
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-tight text-white sm:text-5xl">
            Deux expertises au service de l&apos;hôpital
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-200/90 sm:text-lg">
            Ingénierie biomédicale et architecture hospitalière : des prestations complémentaires
            pour couvrir tout le cycle de vie d&apos;un projet de santé.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {services.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="rounded-full border border-white/30 px-5 py-2 text-sm font-semibold text-white/90 transition hover:border-white hover:text-white"
              >
                {s.tag}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <div className="bg-kbio-surface">
        {services.map((s, idx) => (
          <section
            key={s.id}
            id={s.id}
            className="scroll-mt-20 mx-auto max-w-6xl px-4 py-16 lg:px-6 lg:py-24"
          >
            {/* Tag + heading */}
            <div className="mb-12">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-kbio-teal">
                {s.tag}
              </p>
              <h2 className="mt-3 max-w-2xl font-display text-3xl font-bold tracking-tight text-kbio-navy sm:text-4xl">
                {s.heading}
              </h2>
              <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-600">
                {s.intro}
              </p>
            </div>

            <div className={`grid gap-8 lg:grid-cols-2 lg:items-start ${idx % 2 === 1 ? "" : ""}`}>
              {/* Image */}
              <div className={`relative aspect-[4/3] overflow-hidden rounded-2xl shadow-lg ${idx % 2 === 1 ? "lg:order-2" : ""}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={s.image}
                  alt={s.heading}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-kbio-navy/60 via-transparent to-transparent" />
              </div>

              {/* Sub-sections */}
              <div className={`space-y-6 ${idx % 2 === 1 ? "lg:order-1" : ""}`}>
                {s.sections.map((section) => (
                  <div
                    key={section.title}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                  >
                    <h3 className="font-display text-lg font-bold text-kbio-navy">
                      {section.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {section.body}
                    </p>
                    <ul className="mt-4 space-y-2">
                      {section.items.map((item) => (
                        <li key={item} className="flex items-start gap-2.5 text-sm text-slate-700">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-kbio-teal" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                {/* Normes */}
                <div className="rounded-2xl border border-slate-100 bg-white px-6 py-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Normes et référentiels
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {s.standards.map((st) => (
                      <span
                        key={st}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-kbio-teal/20 bg-kbio-teal/5 px-3 py-1 text-xs font-semibold text-kbio-teal"
                      >
                        {st}
                      </span>
                    ))}
                  </div>
                </div>

                <Link
                  href={s.cta.href}
                  className="inline-flex items-center gap-2 rounded-full bg-kbio-navy px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#002f5c]"
                >
                  {s.cta.label}
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                    <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            </div>

            {idx < services.length - 1 ? (
              <div className="mt-16 border-t border-slate-200" />
            ) : null}
          </section>
        ))}
      </div>

      {/* CTA final */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-kbio-navy to-[#0a5591] p-10 text-white shadow-xl sm:p-14">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-kbio-teal-light">
                Démarrer un projet
              </p>
              <h2 className="mt-3 font-display text-2xl font-bold leading-tight sm:text-3xl">
                Démarrer une étude ou un audit
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-200/90">
                Décrivez-nous votre contexte et vos objectifs. Nous revenons avec une proposition
                de phase de cadrage adaptée à vos besoins.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/contact"
                  className="inline-flex rounded-full bg-white px-6 py-3 text-sm font-bold text-kbio-navy shadow-md transition hover:bg-slate-100"
                >
                  Formulaire de contact
                </Link>
                <a
                  href="mailto:contact@kbio-conseil.com"
                  className="inline-flex rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  contact@kbio-conseil.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
