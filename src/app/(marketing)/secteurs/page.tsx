import type { Metadata } from "next";
import { Building, HeartPulse, Landmark, Microscope } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SectionHeading } from "@/components/marketing/section-heading";
import { IMG } from "@/lib/marketing-images";

export const metadata: Metadata = {
  title: "Secteurs",
  description:
    "Hopitaux, cliniques, institutions et industrie : K'BIO adapte ses missions aux enjeux de chaque environnement.",
};

const blocks = [
  {
    title: "Etablissements publics & CHU",
    text: "Programmation d'equipements, grands projets de renovation, coordination AMO et conformite avec les referentiels hospitaliers.",
    icon: Building,
    image: IMG.building,
  },
  {
    title: "Cliniques & centres specialises",
    text: "Flux patients, salles techniques, dialyse, imagerie : optimisation des investissements et mise en service maîtrisee.",
    icon: HeartPulse,
    image: IMG.lab,
  },
  {
    title: "Institutions & bailleurs",
    text: "Cadrage de programmes, reporting, appui aux appels d'offres et suivi de deploiement multi-sites.",
    icon: Landmark,
    image: IMG.teamMeeting,
  },
  {
    title: "Industrie & dispositifs",
    text: "Interfaces entre exploitation hospitaliere et contraintes fabricants : essais, integration et maintenance.",
    icon: Microscope,
    image: IMG.techMedical,
  },
];

export default function SecteursPage() {
  return (
    <main>
      <section className="border-b border-teal-100 bg-gradient-to-b from-cyan-50/60 to-white">
        <div className="mx-auto max-w-6xl px-4 py-16 lg:px-6 lg:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-600">Secteurs</p>
          <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-kbio-navy sm:text-4xl lg:text-5xl">
            Des equipes qui parlent votre langage metier
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-600">
            Chaque environnement a ses contraintes : nous adaptons les missions, les livrables et le rythme de
            pilotage — sans sacrifier la rigueur technique.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-16 px-4 py-16 lg:px-6 lg:py-20">
        {blocks.map((b, i) => (
          <article
            key={b.title}
            className={`grid gap-10 lg:grid-cols-2 lg:items-center ${i % 2 === 1 ? "lg:flex-row-reverse" : ""}`}
          >
            <div className={`relative aspect-[16/10] overflow-hidden rounded-3xl shadow-lg ring-1 ring-slate-200/80 ${i % 2 === 1 ? "lg:order-2" : ""}`}>
              <Image src={b.image} alt="" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-kbio-navy/50 to-transparent" />
            </div>
            <div className={i % 2 === 1 ? "lg:order-1" : ""}>
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                <b.icon className="h-6 w-6" strokeWidth={1.75} aria-hidden />
              </span>
              <h2 className="mt-5 text-2xl font-semibold text-kbio-navy">{b.title}</h2>
              <p className="mt-4 text-slate-600 leading-relaxed">{b.text}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="border-t border-slate-200 bg-slate-50/80 py-16">
        <div className="mx-auto max-w-6xl px-4 text-center lg:px-6">
          <SectionHeading
            align="center"
            eyebrow="Prochaine etape"
            title="Un besoin sur un de ces secteurs ?"
            description="Decrivez votre contexte : nous proposons une phase de cadrage avant tout engagement long."
          />
          <Link
            href="/contact"
            className="mt-8 inline-flex rounded-full bg-gradient-to-r from-teal-600 to-cyan-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-teal-900/15"
          >
            Nous ecrire
          </Link>
        </div>
      </section>
    </main>
  );
}
