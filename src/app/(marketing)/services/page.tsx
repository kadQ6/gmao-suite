import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SectionHeading } from "@/components/marketing/section-heading";
import { IMG } from "@/lib/marketing-images";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Ingenierie biomedicale, architecture hospitaliere, maintenance, GMAO et assistance a maitrise d'ouvrage pour projets de sante.",
};

type ServiceBlock = {
  title: string;
  color: string;
  items: string[];
  cta?: { href: string; label: string };
};

const services: ServiceBlock[] = [
  {
    title: "Ingenierie biomedicale",
    color: "from-teal-500/10 to-cyan-500/5",
    items: [
      "Audit de parc et evaluation des risques",
      "Plan d'investissement et priorisation",
      "Specifications techniques pour appels d'offres",
      "Reception, essais et commissioning",
    ],
  },
  {
    title: "Architecture hospitaliere",
    color: "from-indigo-500/10 to-violet-500/5",
    items: [
      "Programmation et organisation des unites",
      "Optimisation des flux patients et logistiques",
      "Integration des equipements critiques",
      "Fluides medicaux et infrastructures associees",
    ],
  },
  {
    title: "Maintenance biomedicale (CiMB)",
    color: "from-amber-500/15 to-orange-500/5",
    items: [
      "Maintenance preventive et corrective",
      "Contrats multi-sites",
      "Conformite et traçabilite",
    ],
  },
  {
    title: "GMAO & digitalisation",
    color: "from-emerald-500/10 to-teal-500/5",
    items: [
      "Deploiement d'outils GMAO",
      "Tableaux de bord et indicateurs (MTBF, MTTR, disponibilite)",
      "Suivi temps reel des interventions",
    ],
    cta: {
      href: "/portal/gmao-biomed",
      label: "Acceder au module GMAO biomedicale (portail)",
    },
  },
  {
    title: "Assistance a maitrise d'ouvrage (AMO)",
    color: "from-rose-500/10 to-pink-500/5",
    items: [
      "Pilotage de projet et coordination des fournisseurs",
      "Validation technique des livrables",
      "Reporting pour institutionnels et bailleurs",
    ],
  },
];

export default function ServicesPage() {
  return (
    <main>
      <section className="relative border-b border-teal-100 bg-gradient-to-br from-cyan-50/80 via-white to-indigo-50/50">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 lg:grid-cols-2 lg:items-center lg:gap-14 lg:px-6 lg:py-20">
          <div>
            <SectionHeading
              eyebrow="Services"
              title="Une offre transversale pour les projets de sante"
              description="Prestations concues pour les environnements exigeants : conformite, documentation, coordination multi-acteurs et mise en service controlee."
            />
          </div>
          <div className="relative aspect-[16/10] overflow-hidden rounded-3xl shadow-xl ring-1 ring-slate-200/80">
            <Image
              src={IMG.lab}
              alt="Environnement technique sante"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 45vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-kbio-navy/30 to-transparent" />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-8 px-4 py-16 lg:px-6">
        {services.map((block) => (
          <section
            key={block.title}
            className={`rounded-2xl border border-slate-200/90 bg-gradient-to-br ${block.color} p-8 shadow-sm`}
          >
            <h2 className="text-xl font-semibold text-kbio-navy">{block.title}</h2>
            <ul className="mt-5 space-y-3">
              {block.items.map((item) => (
                <li key={item} className="flex gap-3 text-sm text-slate-700">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            {block.cta ? (
              <Link
                href={block.cta.href}
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:underline"
              >
                {block.cta.label}
                <span aria-hidden>→</span>
              </Link>
            ) : null}
          </section>
        ))}
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-20 lg:px-6">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-kbio-navy to-teal-900 px-8 py-12 text-white shadow-xl sm:px-12">
          <h2 className="text-xl font-semibold sm:text-2xl">Demander une etude ou un audit</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-200">
            Decrivez votre contexte et vos objectifs : nous revenons vers vous avec une proposition de phase de
            cadrage et un planning indicatif.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-kbio-navy shadow-lg transition hover:bg-slate-100"
          >
            Formulaire de contact
          </Link>
        </div>
      </div>
    </main>
  );
}
