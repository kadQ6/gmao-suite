import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Services",
};

const services = [
  {
    title: "Ingenierie biomedicale",
    items: [
      "Audit de parc et evaluation des risques",
      "Plan d'investissement et priorisation",
      "Specifications techniques pour appels d'offres",
      "Reception, essais et commissioning",
    ],
  },
  {
    title: "Architecture hospitaliere",
    items: [
      "Programmation et organisation des unites",
      "Optimisation des flux patients et logistiques",
      "Integration des equipements critiques",
      "Fluides medicaux et infrastructures associees",
    ],
  },
  {
    title: "Maintenance biomedicale (CiMB)",
    items: [
      "Maintenance preventive et corrective",
      "Contrats multi-sites",
      "Conformite et traçabilite",
    ],
  },
  {
    title: "GMAO & digitalisation",
    items: [
      "Deploiement d'outils GMAO",
      "Tableaux de bord et indicateurs (MTBF, MTTR, disponibilite)",
      "Suivi temps reel des interventions",
    ],
  },
  {
    title: "Assistance a maitrise d'ouvrage (AMO)",
    items: [
      "Pilotage de projet et coordination des fournisseurs",
      "Validation technique des livrables",
      "Reporting pour institutionnels et bailleurs",
    ],
  },
];

export default function ServicesPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-16 lg:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-kbio-teal">Services</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-kbio-navy sm:text-4xl">
        Une offre transversale pour les projets de sante
      </h1>
      <p className="mt-6 max-w-3xl text-lg leading-relaxed text-slate-600">
        Des prestations pensées pour les environnements exigeants : conformite, documentation, coordination multi-acteurs
        et mise en service controlee.
      </p>

      <div className="mt-14 space-y-10">
        {services.map((block) => (
          <section key={block.title} className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-kbio-navy">{block.title}</h2>
            <ul className="mt-4 list-inside list-disc space-y-2 text-sm text-slate-600">
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="mt-14 rounded-2xl bg-kbio-navy px-8 py-10 text-white">
        <h2 className="text-xl font-semibold">Demander une etude ou un audit</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-200">
          Decrivez votre contexte et vos objectifs : nous revenons vers vous avec une proposition de phase de
          cadrage.
        </p>
        <Link
          href="/contact"
          className="mt-6 inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-kbio-navy"
        >
          Formulaire de contact
        </Link>
      </div>
    </main>
  );
}
