import Link from "next/link";
import { HeroSlider } from "@/components/marketing/hero-slider";
import { PartnersMarquee } from "@/components/marketing/partners-marquee";
import { missions } from "@/components/marketing/data";

const activities = [
  {
    id: "architecture",
    href: "/services#architecture",
    title: "Architecture hospitaliere",
    description:
      "Expertise biomedicale dans les projets de conception architecturale hospitaliere, de reorganisation, de reamenagement, de demenagement.",
    image: "/missions/chi-compiegne.webp",
  },
  {
    id: "conseil-biomedical",
    href: "/services#conseil-biomedical",
    title: "Ingenierie biomedicale",
    description:
      "Accompagnement de la gestion biomedicale interne. Audit, externalisation et mise a disposition de competences pour ameliorer l'offre de soins.",
    image: "/missions/biomedical-pc.webp",
  },
];

const featured = [
  "beira-mozambique",
  "chr-gabon",
  "hm6-bouskoura",
  "medipole",
  "chi-compiegne",
  "chi-poissy",
];

export default function MarketingHomePage() {
  const featuredMissions = featured
    .map((slug) => missions.find((m) => m.slug === slug))
    .filter(Boolean) as typeof missions;

  return (
    <main>
      {/* 1. Slider photo-seul */}
      <HeroSlider />

      {/* 2. Banniere tagline — identique au .fr */}
      <div className="bg-kbio-navy py-7 text-center">
        <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
          K&apos;BIO &ndash; ingenierie biomedicale
        </h1>
      </div>

      {/* 3. Nos activites — layout 2 colonnes comme .fr */}
      <section className="bg-kbio-surface py-16">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <h2 className="mb-10 font-display text-4xl font-bold text-kbio-teal sm:text-5xl">
            Nos activit&eacute;s
          </h2>

          <div className="space-y-8">
            {activities.map((a, i) => (
              <div
                key={a.id}
                className={`flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm md:flex-row ${
                  i % 2 === 1 ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* Image card avec overlay */}
                <div className="relative min-h-[260px] flex-1 overflow-hidden md:min-h-[300px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={a.image}
                    alt={a.title}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-end bg-kbio-navy/65 p-6">
                    <h3 className="font-display text-2xl font-bold text-white leading-tight">
                      {a.title}
                    </h3>
                  </div>
                </div>

                {/* Texte */}
                <div className="flex flex-1 flex-col justify-center p-8 lg:p-10">
                  <h3 className="font-display text-xl font-semibold text-kbio-navy">
                    {a.title}
                  </h3>
                  <p className="mt-4 text-base leading-relaxed text-slate-600">
                    {a.description}
                  </p>
                  <Link
                    href={a.href}
                    className="mt-6 inline-flex w-fit items-center gap-2 text-sm font-semibold text-kbio-teal transition hover:text-kbio-navy"
                  >
                    En savoir plus&hellip;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Projets — 6 projets comme .fr */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <h2 className="mb-2 font-display text-3xl font-bold text-kbio-navy sm:text-4xl">
            Nos derni&egrave;res missions
          </h2>
          <p className="mb-10 text-base text-slate-500">
            Selection de projets biomedicaux et architecturaux accompagnes par K&apos;BIO.
          </p>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredMissions.map((m) => (
              <Link
                key={m.slug}
                href={`/references/${m.slug}`}
                className="group relative block aspect-[4/3] overflow-hidden rounded-xl shadow-md transition hover:shadow-xl"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={m.image}
                  alt={m.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#001a33]/90 via-[#001a33]/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                  <p className="text-xs font-semibold uppercase tracking-widest text-kbio-teal-light">
                    {m.type === "biomedical" ? "Biomedical" : m.type === "architecture" ? "Architecture" : "AMO"}
                  </p>
                  <h3 className="mt-1 font-display text-lg font-bold leading-snug">
                    {m.title}
                  </h3>
                  <p className="mt-0.5 text-sm text-slate-300">{m.location}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/references"
              className="inline-flex items-center gap-2 rounded-full border border-kbio-teal px-6 py-3 text-sm font-semibold text-kbio-teal transition hover:bg-kbio-teal hover:text-white"
            >
              Voir toutes nos missions &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Partenaires */}
      <PartnersMarquee />
    </main>
  );
}
