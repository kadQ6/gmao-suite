import type { Metadata } from "next";
import Link from "next/link";
import { missions } from "@/components/marketing/data";

export const metadata: Metadata = {
  title: "Nos missions",
  description:
    "Missions biomedicales et architecturales realisees ou en cours par K'BIO en France et a l'international.",
};

function MissionCard({ m, priority = false }: { m: (typeof missions)[number]; priority?: boolean }) {
  return (
    <Link
      href={`/references/${m.slug}`}
      className="group relative block aspect-[4/5] overflow-hidden rounded-2xl shadow-md transition hover:shadow-2xl"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={m.image}
        alt={m.title}
        loading={priority ? "eager" : "lazy"}
        className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#001a33] via-[#001a33]/55 to-transparent" />
      <div className="relative flex h-full flex-col justify-end p-6 text-white">
        {m.status === "en-cours" ? (
          <span className="mb-3 inline-flex w-fit items-center gap-2 rounded-full bg-kbio-accent/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide">
            <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-white" />
            En cours
          </span>
        ) : (
          <span className="mb-3 inline-flex w-fit rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide backdrop-blur">
            {m.type === "biomedical" ? "Biomedical" : m.type === "architecture" ? "Architecture" : "AMO"}
          </span>
        )}
        <h3 className="font-display text-xl font-semibold leading-tight">{m.title}</h3>
        <p className="mt-1 text-sm text-slate-200">{m.location}</p>
        <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-kbio-teal-light">
          Voir le projet <span aria-hidden>&rarr;</span>
        </span>
      </div>
    </Link>
  );
}

export default function ReferencesPage() {
  const france = missions.filter((m) => m.zone === "france");
  const international = missions.filter((m) => m.zone === "international");
  const enCours = missions.filter((m) => m.status === "en-cours");

  return (
    <main>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 kbio-hero-accent" aria-hidden />
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{ backgroundImage: "url(/missions/medipole.webp)" }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#02294d]/40" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 py-20 lg:px-6 lg:py-24">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-kbio-teal-light">
            Nos missions
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-tight text-white sm:text-5xl">
            Nos projets marquants, en France et a l&apos;international.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-100/90 sm:text-lg">
            Avec un solide portefeuille de projets, notre expertise biomedicale a contribue de
            maniere significative a l&apos;avancement des clients accompagnes.
          </p>
          {enCours.length > 0 ? (
            <div className="mt-8 flex items-center gap-2">
              <span className="pulse-dot inline-flex h-2 w-2 rounded-full bg-kbio-accent" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-kbio-accent">
                {enCours.length} mission{enCours.length > 1 ? "s" : ""} en cours
              </span>
            </div>
          ) : null}
        </div>
      </section>

      {/* France */}
      <section id="france" className="scroll-mt-20 mx-auto max-w-6xl px-4 py-16 lg:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-kbio-teal">
          France
        </p>
        <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-kbio-navy sm:text-4xl">
          Nos projets en France
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {france.map((m, i) => (
            <MissionCard key={m.slug} m={m} priority={i < 3} />
          ))}
        </div>
      </section>

      {/* International */}
      <section id="international" className="scroll-mt-20 bg-kbio-surface py-16">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-kbio-teal">
            International
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-kbio-navy sm:text-4xl">
            Nos projets a l&apos;international
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {international.map((m) => (
              <MissionCard key={m.slug} m={m} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 lg:px-6">
        <div className="rounded-3xl bg-gradient-to-br from-kbio-navy to-[#0a5591] p-8 text-white sm:p-12">
          <h2 className="font-display text-2xl font-semibold sm:text-3xl">
            Liberez le potentiel de vos projets biomedicaux.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-100/90">
            Nous preparons des dossiers de reference sur mesure pour les appels d&apos;offres et les
            financeurs institutionnels.
          </p>
          <Link
            href="/contact"
            className="mt-7 inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-kbio-navy transition hover:bg-slate-100"
          >
            Nous contacter
          </Link>
        </div>
      </section>
    </main>
  );
}
