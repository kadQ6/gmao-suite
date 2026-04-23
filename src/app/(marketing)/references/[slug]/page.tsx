import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { missions } from "@/components/marketing/data";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return missions.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<Params> },
): Promise<Metadata> {
  const { slug } = await params;
  const mission = missions.find((m) => m.slug === slug);
  if (!mission) return { title: "Mission introuvable" };
  return {
    title: mission.title,
    description: mission.summary,
  };
}

export default async function MissionDetailPage(
  { params }: { params: Promise<Params> },
) {
  const { slug } = await params;
  const mission = missions.find((m) => m.slug === slug);
  if (!mission) notFound();

  const others = missions.filter((m) => m.slug !== slug).slice(0, 3);

  return (
    <main>
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${mission.image})` }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#02294d]/70 via-[#02294d]/60 to-[#02294d]/85" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 py-24 lg:px-6 lg:py-28">
          <Link
            href="/references"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-kbio-teal-light hover:text-white"
          >
            <span aria-hidden>&larr;</span> Nos missions
          </Link>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            {mission.status === "en-cours" ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-kbio-accent/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-white" />
                En cours
              </span>
            ) : (
              <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur">
                {mission.type === "biomedical" ? "Biomedical" : mission.type === "architecture" ? "Architecture" : "AMO"}
              </span>
            )}
            <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur">
              {mission.year}
            </span>
          </div>
          <h1 className="mt-5 max-w-3xl font-display text-4xl font-semibold leading-tight text-white sm:text-5xl">
            {mission.title}
          </h1>
          <p className="mt-3 text-lg text-slate-100/90">{mission.location}</p>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-100/90">
            {mission.summary}
          </p>
        </div>
      </section>

      {mission.stats && mission.stats.length > 0 ? (
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-10 lg:px-6">
            <p className="mb-6 text-xs font-semibold uppercase tracking-[0.22em] text-kbio-teal">
              Les Chiffres
            </p>
            <dl className="grid gap-6 sm:grid-cols-3">
              {mission.stats.map((s) => (
                <div
                  key={s.label}
                  className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-kbio-teal/10 font-display text-lg font-bold text-kbio-teal">
                    {s.value}
                  </div>
                  <dt className="text-sm font-medium text-slate-600">{s.label}</dt>
                </div>
              ))}
            </dl>
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-6xl px-4 py-16 lg:px-6">
        <div className="grid gap-12 lg:grid-cols-[1.3fr,1fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-kbio-teal">
              Contexte
            </p>
            <h2 className="mt-3 font-display text-2xl font-semibold text-kbio-navy">
              Le projet
            </h2>
            <div className="mt-5 space-y-4 text-base leading-relaxed text-slate-600">
              {(mission.description ?? [mission.summary]).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>

          {mission.scope ? (
            <aside className="rounded-2xl bg-kbio-surface p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-kbio-teal">
                Les Missions
              </p>
              <ul className="mt-5 space-y-3 text-sm text-slate-700">
                {mission.scope.map((s) => (
                  <li key={s} className="flex items-start gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-kbio-teal" />
                    {s}
                  </li>
                ))}
              </ul>
              <Link
                href="/references"
                className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-kbio-teal hover:text-kbio-navy"
              >
                Decouvrir les autres projets <span aria-hidden>&rarr;</span>
              </Link>
            </aside>
          ) : null}
        </div>
      </section>

      <section className="bg-kbio-surface py-16">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-kbio-teal">
                Autres missions
              </p>
              <h2 className="mt-3 font-display text-2xl font-semibold text-kbio-navy sm:text-3xl">
                Continuer la visite
              </h2>
            </div>
            <Link
              href="/references"
              className="hidden rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-kbio-navy transition hover:border-kbio-teal hover:text-kbio-teal sm:inline-flex"
            >
              Toutes les missions
            </Link>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {others.map((m) => (
              <Link
                key={m.slug}
                href={`/references/${m.slug}`}
                className="group relative block aspect-[4/5] overflow-hidden rounded-2xl shadow-md transition hover:shadow-2xl"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={m.image}
                  alt={m.title}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#001a33] via-[#001a33]/55 to-transparent" />
                <div className="relative flex h-full flex-col justify-end p-6 text-white">
                  <h3 className="font-display text-lg font-semibold leading-tight">{m.title}</h3>
                  <p className="mt-1 text-sm text-slate-200">{m.location}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-kbio-teal-light">
                    Voir le projet <span aria-hidden>&rarr;</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
