import {
  Activity,
  ArrowRight,
  Building2,
  Globe2,
  Layers,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SectionHeading } from "@/components/marketing/section-heading";
import { IMG } from "@/lib/marketing-images";

const expertises = [
  {
    title: "Ingenierie biomedicale",
    body: "Audits de parc, plans d'investissement, cahiers des charges, reception technique et mise en service conforme.",
    icon: Activity,
    accent: "from-teal-400/20 to-cyan-500/10",
  },
  {
    title: "Architecture hospitaliere",
    body: "Programmation fonctionnelle, optimisation des flux, integration des equipements critiques et fluides medicaux.",
    icon: Building2,
    accent: "from-indigo-400/20 to-violet-500/10",
  },
  {
    title: "Maintenance & GMAO",
    body: "Maintenance preventive et corrective, contrats multi-sites, conformite, indicateurs et pilotage par la donnee.",
    icon: Wrench,
    accent: "from-amber-400/25 to-orange-500/10",
  },
  {
    title: "Projets internationaux",
    body: "Appui aux bailleurs et etablissements : coordination, reporting et deploiement sur le terrain.",
    icon: Globe2,
    accent: "from-rose-400/15 to-pink-500/10",
  },
];

const steps = [
  { title: "Diagnostic", body: "Comprendre le contexte, les contraintes et les objectifs operationnels." },
  { title: "Conception", body: "Structurer une solution technique et organisationnelle realiste et budgetee." },
  { title: "Mise en oeuvre", body: "Coordonner les acteurs, les livrables et le calendrier avec transparence." },
  { title: "Validation", body: "Reception, essais, documentation et transfert de competences aux equipes." },
  { title: "Pilotage", body: "Tableaux de bord, GMAO et demarche d'amelioration continue." },
];

const secteurs = [
  { label: "Hopitaux & CHU", color: "bg-teal-500" },
  { label: "Cliniques & centres de dialyse", color: "bg-sky-500" },
  { label: "Ministeres & bailleurs", color: "bg-indigo-500" },
  { label: "Industrie & dispositifs", color: "bg-amber-500" },
];

export default function MarketingHomePage() {
  return (
    <main className="overflow-hidden">
      {/* Hero */}
      <section className="relative border-b border-teal-200/40 bg-gradient-to-br from-white via-cyan-50/50 to-indigo-50/60">
        <div className="pointer-events-none absolute -right-24 top-0 h-96 w-96 rounded-full bg-gradient-to-br from-teal-300/30 to-indigo-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-amber-200/30 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-16 lg:grid-cols-2 lg:items-center lg:px-6 lg:py-24">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-teal-200/80 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-teal-700 shadow-sm backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" aria-hidden />
              K&apos;BIO Group
            </p>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-kbio-navy sm:text-5xl lg:text-[3.15rem] lg:leading-[1.08]">
              Des etablissements de sante{" "}
              <span className="bg-gradient-to-r from-teal-600 to-indigo-600 bg-clip-text text-transparent">
                plus sûrs
              </span>
              , mieux equipes et pilotables.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
              Ingenierie biomedicale, architecture hospitaliere et outils numeriques (GMAO, reporting) pour les
              decideurs, les equipes techniques et les partenaires institutionnels — en Afrique et au-dela.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-teal-600 to-cyan-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-teal-900/15 transition hover:brightness-105"
              >
                Parler de votre projet
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center justify-center rounded-full border-2 border-slate-200/90 bg-white/90 px-6 py-3.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-teal-300 hover:text-kbio-navy"
              >
                Decouvrir les services
              </Link>
              <Link
                href="/login"
                className="inline-flex w-full items-center justify-center rounded-full text-sm font-medium text-slate-500 underline-offset-4 hover:text-kbio-navy hover:underline sm:w-auto sm:pl-2"
              >
                Acces portail client
              </Link>
            </div>
            <dl className="mt-14 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/80 bg-white/90 p-5 shadow-md shadow-teal-900/5 backdrop-blur">
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Experience</dt>
                <dd className="mt-2 text-2xl font-semibold text-kbio-navy">15+ ans</dd>
                <p className="mt-1 text-xs text-slate-500">Conseil et terrain sur des programmes exigeants</p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white/90 p-5 shadow-md shadow-teal-900/5 backdrop-blur">
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Rayonnement</dt>
                <dd className="mt-2 text-2xl font-semibold text-kbio-navy">Afrique</dd>
                <p className="mt-1 text-xs text-slate-500">Projets multi-pays et partenariats institutionnels</p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white/90 p-5 shadow-md shadow-teal-900/5 backdrop-blur">
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Approche</dt>
                <dd className="mt-2 text-2xl font-semibold text-kbio-navy">Terrain + data</dd>
                <p className="mt-1 text-xs text-slate-500">Methodologie traceable, livrables actionnables</p>
              </div>
            </dl>
          </div>
          <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-2xl shadow-indigo-900/20 ring-1 ring-white/60">
              <Image
                src={IMG.heroHospital}
                alt="Environnement hospitalier moderne"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-kbio-navy/50 via-transparent to-teal-500/20" />
              <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-white/95 p-4 shadow-lg backdrop-blur sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-xs">
                <p className="text-sm font-semibold text-kbio-navy">Engineering healthcare systems that work.</p>
                <p className="mt-1 text-xs text-slate-600">
                  De la strategie a la maintenance : une chaine de valeur coherente pour vos investissements sante.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Secteurs */}
      <section className="border-b border-slate-200/80 bg-white py-10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-3 px-4 lg:px-6">
          {secteurs.map((s) => (
            <span
              key={s.label}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50/90 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm"
            >
              <span className={`h-2 w-2 rounded-full ${s.color}`} aria-hidden />
              {s.label}
            </span>
          ))}
          <Link
            href="/secteurs"
            className="inline-flex items-center gap-1 text-sm font-semibold text-teal-600 hover:underline"
          >
            Voir les secteurs
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Expertises */}
      <section className="mx-auto max-w-6xl px-4 py-20 lg:px-6">
        <SectionHeading
          eyebrow="Expertises"
          title="Une offre integree pour vos projets de sante"
          description="Du diagnostic a la mise en production : conformite, documentation, coordination multi-acteurs et resultats mesurables."
        />
        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {expertises.map((item) => (
            <article
              key={item.title}
              className={`group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-br ${item.accent} p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg`}
            >
              <div className="flex gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/90 text-teal-600 shadow-sm ring-1 ring-slate-200/80">
                  <item.icon className="h-6 w-6" strokeWidth={1.75} aria-hidden />
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-kbio-navy">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.body}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap items-center gap-6">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-sm font-semibold text-teal-600 hover:underline"
          >
            Detail des prestations
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Bande image + methode */}
      <section className="border-y border-slate-200 bg-gradient-to-r from-slate-50 via-white to-cyan-50/40">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-6 lg:py-20">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-xl ring-1 ring-slate-200/80">
            <Image
              src={IMG.techMedical}
              alt="Equipements et soins"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 45vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-kbio-navy/40 to-transparent" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-teal-600">
              <Layers className="h-4 w-4" />
              Methode K&apos;BIO
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-kbio-navy sm:text-3xl">
              Une progression claire pour securiser vos decisions
            </h2>
            <p className="mt-3 text-slate-600">
              Aligner technique, organisation et financement — avec des jalons lisibles pour vos equipes et vos
              partenaires.
            </p>
            <ol className="mt-8 space-y-5">
              {steps.map((step, index) => (
                <li key={step.title} className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 text-sm font-bold text-white shadow-md">
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
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-20 lg:px-6">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-900 via-kbio-navy to-teal-900 px-8 py-14 text-white shadow-2xl sm:px-14">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-teal-400/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-indigo-400/20 blur-3xl" />
          <div className="relative grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-teal-100">
                <ShieldCheck className="h-4 w-4 text-teal-300" />
                Conseil & plateformes
              </div>
              <h2 className="mt-4 text-2xl font-semibold sm:text-3xl">Au-dela du conseil : des outils qui restent</h2>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-200">
                GMAO, plans d&apos;action, tableaux de bord et reporting pour les equipes terrain et les financeurs —
                pour une visibilite durable sur vos actifs et vos interventions.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link
                href="/references"
                className="inline-flex justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-kbio-navy shadow-lg transition hover:bg-slate-100"
              >
                References & cas
              </Link>
              <Link
                href="/login"
                className="inline-flex justify-center rounded-full border border-white/35 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Portail client
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
