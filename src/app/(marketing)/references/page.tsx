import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "References",
};

const cases = [
  {
    title: "CHU — deploiement GMAO multi-sites",
    context: "Pilotage centralise des equipements et des interventions.",
    status: "Fiche a valider avec donnees et habillage photo officiels.",
  },
  {
    title: "Programme oxygene — appui technique",
    context: "Coordination technique et conformite pour deploiement terrain.",
    status: "Contenu indicatif : ajuster selon missions reelles et accords de communication.",
  },
  {
    title: "Centre de dialyse — reception et mise en service",
    context: "Assurance qualite des installations et transfert de competences.",
    status: "A completer avec jalons et resultats mesurables.",
  },
];

export default function ReferencesPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-16 lg:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-kbio-teal">References</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-kbio-navy sm:text-4xl">
        Projets et experiences
      </h1>
      <p className="mt-6 max-w-3xl text-lg leading-relaxed text-slate-600">
        Des references presentees avec sobriete : chaque fiche pourra etre enrichie de livrables, indicateurs et
        temoignages apres validation interne.
      </p>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {cases.map((c) => (
          <article key={c.title} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-kbio-navy">{c.title}</h2>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">{c.context}</p>
            <p className="mt-4 text-xs text-slate-400">{c.status}</p>
          </article>
        ))}
      </div>

      <p className="mt-12 text-sm text-slate-500">
        Besoin d&apos;une presentation adaptee a un appel d&apos;offres ou un bailleur ?{" "}
        <Link href="/contact" className="font-medium text-kbio-teal hover:underline">
          Contactez-nous
        </Link>
        .
      </p>
    </main>
  );
}
