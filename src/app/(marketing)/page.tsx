import Link from "next/link";

const expertises = [
  {
    title: "Ingenierie biomedicale",
    body: "Audits de parc, plans d'investissement, specifications d'appels d'offres, reception et commissioning.",
  },
  {
    title: "Architecture hospitaliere",
    body: "Programmation fonctionnelle, optimisation des flux, integration des equipements critiques et fluides medicaux.",
  },
  {
    title: "Maintenance & GMAO",
    body: "Maintenance preventive et corrective, contrats multi-sites, conformite et pilotage par la donnee.",
  },
  {
    title: "Projets internationaux",
    body: "Accompagnement des bailleurs et des etablissements : coordination technique, reporting et deploiement terrain.",
  },
];

const steps = [
  { title: "Diagnostic", body: "Comprendre le contexte, les contraintes et les objectifs operationnels." },
  { title: "Conception", body: "Structurer une solution technique et organisationnelle realiste." },
  { title: "Mise en oeuvre", body: "Coordonner les acteurs, les livrables et le calendrier." },
  { title: "Validation", body: "Reception, essais et transfert de competences." },
  { title: "Pilotage", body: "Tableaux de bord, GMAO et amelioration continue." },
];

export default function MarketingHomePage() {
  return (
    <main>
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-gradient-to-b from-white via-slate-50 to-slate-100">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-100/40 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 lg:px-6 lg:py-28">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-kbio-teal">K&apos;BIO Group</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-kbio-navy sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
            Engineering healthcare systems that work.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
            Ingenierie biomedicale, architecture hospitaliere et solutions digitales pour des etablissements de sante
            plus sûrs, plus performants et mieux pilotés — en Afrique et au-dela.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full bg-kbio-navy px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-kbio-navy/90"
            >
              Demander une etude
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-kbio-teal/50"
            >
              Acceder au portail client
            </Link>
          </div>
          <dl className="mt-16 grid gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Chiffres cles</dt>
              <dd className="mt-2 text-2xl font-semibold text-kbio-navy">A confirmer</dd>
              <p className="mt-1 text-sm text-slate-500">Etablissements accompagnes (a actualiser)</p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Rayonnement</dt>
              <dd className="mt-2 text-2xl font-semibold text-kbio-navy">Afrique</dd>
              <p className="mt-1 text-sm text-slate-500">Projets internationaux et partenariats institutionnels</p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Approche</dt>
              <dd className="mt-2 text-2xl font-semibold text-kbio-navy">Terrain + data</dd>
              <p className="mt-1 text-sm text-slate-500">Methodologie eprouvee, livrables traceables</p>
            </div>
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 lg:px-6">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-semibold tracking-tight text-kbio-navy sm:text-3xl">Expertises</h2>
          <p className="mt-3 text-slate-600">
            Une offre integree pour les ministeres, les etablissements et les bailleurs : du diagnostic a la mise en
            production, avec une exigence de conformite et de resultats.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {expertises.map((item) => (
            <article
              key={item.title}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-kbio-teal/40 hover:shadow-md"
            >
              <h3 className="text-lg font-semibold text-kbio-navy">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{item.body}</p>
            </article>
          ))}
        </div>
        <div className="mt-10">
          <Link href="/services" className="text-sm font-semibold text-kbio-teal hover:underline">
            Voir le detail des services
          </Link>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20 lg:px-6">
          <h2 className="text-2xl font-semibold tracking-tight text-kbio-navy sm:text-3xl">Methode K&apos;BIO</h2>
          <p className="mt-3 max-w-2xl text-slate-600">
            Une progression claire pour securiser les decisions et aligner technique, organisation et financement.
          </p>
          <ol className="mt-12 space-y-6">
            {steps.map((step, index) => (
              <li key={step.title} className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-kbio-navy">
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-semibold text-kbio-navy">{step.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 lg:px-6">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-kbio-navy to-slate-900 px-8 py-12 text-white shadow-xl sm:px-12">
          <h2 className="text-2xl font-semibold sm:text-3xl">Une societe et une plateforme</h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-200">
            Au-dela du conseil, K&apos;BIO deploie des outils de suivi : GMAO, plans d&apos;action, tableaux de bord et
            reporting pour les equipes terrain et les financeurs.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/references"
              className="inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-kbio-navy transition hover:bg-slate-100"
            >
              Voir les references
            </Link>
            <Link
              href="/login"
              className="inline-flex rounded-full border border-white/30 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Acceder au portail
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
