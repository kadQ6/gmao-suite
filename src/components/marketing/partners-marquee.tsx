import { partners } from "./data";

export function PartnersMarquee() {
  const loop = [...partners, ...partners];
  return (
    <section className="border-y border-slate-200 bg-white py-14">
      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        <div className="flex flex-col items-center text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-kbio-teal">
            Ils nous font confiance
          </p>
          <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-kbio-navy sm:text-3xl">
            Partenaires et fournisseurs
          </h2>
        </div>
      </div>

      <div className="relative mt-10 overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-white to-transparent" />

        <div className="marquee-track flex w-max items-center gap-10 px-6">
          {loop.map((p, i) => (
            <div
              key={`${p.name}-${i}`}
              className="flex h-14 w-36 shrink-0 items-center justify-center rounded-lg bg-slate-50 px-4"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.logo}
                alt={p.name}
                loading="lazy"
                className="max-h-10 w-auto max-w-full object-contain opacity-70 transition hover:opacity-100"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
