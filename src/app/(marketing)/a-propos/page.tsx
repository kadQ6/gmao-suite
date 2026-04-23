import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "À propos",
  description:
    "K'BIO : cabinet de conseil en ingénierie biomédicale et architecture hospitalière. Notre équipe, notre approche, nos implantations.",
};

const values = [
  {
    title: "Exigence technique",
    body: "Des livrables documentés, des spécifications testées, une réception contrôlée.",
  },
  {
    title: "Terrain",
    body: "La décision se prend au plus près des équipes, dans les services, avec les utilisateurs.",
  },
  {
    title: "Continuité",
    body: "Un accompagnement de l'étude initiale à la mise en service, puis au pilotage par la donnée.",
  },
];

const team = [
  {
    name: "Kader OMAR",
    role: "Fondateur — Ingénieur biomédical",
    bio: "Expert en ingénierie biomédicale et architecture hospitalière. Plus de 10 ans d'expérience sur projets français et internationaux (France, Afrique, Moyen-Orient).",
    image: "/missions/team-placeholder.svg",
    linkedin: "https://www.linkedin.com/in/kader-omar-95787458/",
  },
];

const entities = [
  { name: "K'BIO", role: "Cabinet français — Jassans-Riottier" },
  { name: "K'BIO Djibouti", role: "Filiale CiMB / Horncare — Corne de l'Afrique" },
  { name: "Réseau partenaires", role: "Fournisseurs et intégrateurs internationaux" },
];

export default function AboutPage() {
  return (
    <main>
      <section className="relative overflow-hidden bg-kbio-navy">
        <div className="absolute inset-0 bg-gradient-to-br from-kbio-navy via-kbio-navy/95 to-[#0a5591]/80" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 py-20 lg:px-6 lg:py-28">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-kbio-teal-light">
            À propos
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-tight text-white sm:text-5xl">
            Un cabinet dédié aux systèmes hospitaliers exigeants.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-200/90 sm:text-lg">
            K&apos;BIO accompagne les établissements de santé, les ministères et les bailleurs dans la
            conception, le déploiement et le pilotage de leurs infrastructures biomédicales.
          </p>
        </div>
      </section>

      <section className="bg-kbio-surface py-20">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-kbio-teal">Vision</p>
              <h2 className="mt-3 font-display text-2xl font-bold text-kbio-navy">
                Des hôpitaux durables et maintenables
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600">
                Nous croyons qu&apos;un système hospitalier performant repose sur des choix
                techniques documentés, une conception centrée sur les flux et des outils de pilotage
                exploitables au quotidien par les équipes.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-kbio-teal">Mission</p>
              <h2 className="mt-3 font-display text-2xl font-bold text-kbio-navy">
                Sécuriser les investissements santé
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600">
                Aligner besoins cliniques, contraintes techniques et réalités de mise en œuvre.
                Fournir à chaque acteur — du ministère au chef de service — les éléments de
                décision et les livrables opérationnels qui font la différence.
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {values.map((v) => (
              <div key={v.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="font-display text-base font-bold text-kbio-navy">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-kbio-teal">Équipe</p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-kbio-navy sm:text-4xl">
            Une équipe d&apos;ingénieurs sur le terrain
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600">
            Des profils techniques complémentaires, une culture du livrable et de la conformité.
          </p>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:max-w-4xl">
            {team.map((m) => (
              <article
                key={m.name}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={m.image}
                    alt={m.name}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-lg font-bold text-kbio-navy">{m.name}</h3>
                      <p className="text-sm font-semibold text-kbio-teal">{m.role}</p>
                    </div>
                    {m.linkedin && (
                      <a
                        href={m.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`LinkedIn ${m.name}`}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0077b5]/10 text-[#0077b5] transition hover:bg-[#0077b5] hover:text-white"
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                      </a>
                    )}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{m.bio}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-kbio-surface py-20">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-kbio-teal">Implantations</p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-kbio-navy">
            France, Djibouti et au-delà
          </h2>
          <ul className="mt-10 grid gap-4 sm:grid-cols-3">
            {entities.map((e) => (
              <li
                key={e.name}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <p className="font-display text-lg font-bold text-kbio-navy">{e.name}</p>
                <p className="mt-2 text-sm text-slate-600">{e.role}</p>
              </li>
            ))}
          </ul>

          <div className="mt-14 overflow-hidden rounded-3xl bg-gradient-to-br from-kbio-navy to-[#0a5591] p-8 text-white shadow-xl sm:p-12">
            <h2 className="font-display text-2xl font-bold">Travaillons ensemble</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-200/90">
              Présentation, références, offre de collaboration : échangeons sur votre projet.
            </p>
            <Link
              href="/contact"
              className="mt-6 inline-flex rounded-full bg-white px-6 py-3 text-sm font-bold text-kbio-navy shadow-md transition hover:bg-slate-100"
            >
              Nous contacter
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
