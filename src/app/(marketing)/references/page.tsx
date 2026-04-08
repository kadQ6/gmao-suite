import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { IMG } from "@/lib/marketing-images";

export const metadata: Metadata = {
  title: "References",
  description: "Exemples de missions et contextes accompagnes par K'BIO — contenus a valider avec vos references officielles.",
};

const cases = [
  {
    title: "CHU — deploiement GMAO multi-sites",
    context: "Pilotage centralise des equipements et des interventions, harmonisation des procedures et reporting pour la direction technique.",
    status: "Fiche a valider : chiffres, logos et visuels institutionnels.",
    image: IMG.heroHospital,
  },
  {
    title: "Programme oxygene — appui technique",
    context: "Coordination technique, conformite et suivi de deploiement terrain avec les equipes locales et les bailleurs.",
    status: "Contenu indicatif — ajuster selon missions reelles et accords de communication.",
    image: IMG.techMedical,
  },
  {
    title: "Centre de dialyse — reception et mise en service",
    context: "Assurance qualite des installations, essais de reception et transfert de competences vers les equipes soignantes et techniques.",
    status: "A completer avec jalons et indicateurs mesurables.",
    image: IMG.lab,
  },
];

export default function ReferencesPage() {
  return (
    <main>
      <section className="border-b border-teal-100 bg-gradient-to-b from-indigo-50/40 to-white">
        <div className="mx-auto max-w-6xl px-4 py-14 lg:px-6 lg:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-600">References</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-kbio-navy sm:text-4xl lg:text-5xl">
            Projets et experiences
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-slate-600">
            Des illustrations de contextes types — chaque fiche pourra etre enrichie de livrables, indicateurs et
            temoignages apres validation interne et accord des parties prenantes.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-16 lg:px-6">
        <div className="grid gap-8 lg:grid-cols-3">
          {cases.map((c) => (
            <article
              key={c.title}
              className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-md transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              <div className="relative aspect-[16/10]">
                <Image src={c.image} alt="" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 33vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-kbio-navy/60 via-transparent to-transparent" />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h2 className="text-lg font-semibold text-kbio-navy">{c.title}</h2>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">{c.context}</p>
                <p className="mt-4 text-xs text-slate-400">{c.status}</p>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-14 rounded-xl border border-amber-100 bg-amber-50/80 p-4 text-sm text-amber-900">
          Besoin d&apos;une presentation adaptee a un appel d&apos;offres ou un bailleur ?{" "}
          <Link href="/contact" className="font-semibold text-teal-700 underline-offset-2 hover:underline">
            Contactez-nous
          </Link>{" "}
          pour un dossier sur mesure.
        </p>
      </div>
    </main>
  );
}
