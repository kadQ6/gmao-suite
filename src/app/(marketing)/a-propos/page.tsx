import type { Metadata } from "next";
import { Heart, Target } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { IMG } from "@/lib/marketing-images";

export const metadata: Metadata = {
  title: "A propos",
  description:
    "Vision, mission et presence de K'BIO Group : ingenierie sante, terrain et outils numeriques au service des etablissements.",
};

const entities = [
  { name: "K'BIO France", role: "Siege, ingenierie et coordination de programmes" },
  { name: "K'BIO Djibouti", role: "Proximite terrain et deploiement regional" },
  { name: "RIAL Tech", role: "Partenaire technique (selon missions)" },
  { name: "CiMB", role: "Maintenance biomedicale et conformite" },
];

export default function AboutPage() {
  return (
    <main>
      <section className="border-b border-teal-100 bg-gradient-to-b from-white to-cyan-50/40">
        <div className="mx-auto max-w-6xl px-4 py-14 lg:px-6 lg:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-600">A propos</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-kbio-navy sm:text-4xl lg:text-5xl">
            K&apos;BIO Group
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-slate-600">
            Nous accompagnons les acteurs de la sante dans la conception, le deploiement et le pilotage de systemes
            hospitaliers durables. Notre approche combine expertise technique, comprehension du terrain et outils
            numeriques lorsqu&apos;ils accelerent la decision et la conformite.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 lg:grid-cols-2 lg:items-start lg:px-6">
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-xl ring-1 ring-slate-200/80 lg:sticky lg:top-28">
          <Image src={IMG.teamMeeting} alt="Equipe projet" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 45vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-kbio-navy/40 to-transparent" />
        </div>
        <div className="space-y-10">
          <section className="rounded-2xl border border-teal-100 bg-white p-8 shadow-md">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                <Heart className="h-5 w-5" aria-hidden />
              </span>
              <h2 className="text-xl font-semibold text-kbio-navy">Vision</h2>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              Des infrastructures et des dispositifs medicaux au service des patients, avec des systemes documentes,
              maintenables et pilotables dans la duree — sans sacrifier la securite ni la lisibilite pour les equipes.
            </p>
          </section>
          <section className="rounded-2xl border border-indigo-100 bg-white p-8 shadow-md">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                <Target className="h-5 w-5" aria-hidden />
              </span>
              <h2 className="text-xl font-semibold text-kbio-navy">Mission</h2>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              Securiser les investissements sante en alignant besoins cliniques, contraintes techniques et realites de
              mise en oeuvre — des ministeres aux equipes hospitalieres, en restant transparents sur les risques et les
              options.
            </p>
          </section>
        </div>
      </div>

      <section className="border-t border-slate-200 bg-slate-50/80 py-16">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <h2 className="text-2xl font-semibold text-kbio-navy">Presence et entites</h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            Structuration indicative — a ajuster avec vos informations officielles et votre communication institutionnelle.
          </p>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {entities.map((e) => (
              <li
                key={e.name}
                className="rounded-xl border border-white bg-white p-6 shadow-md ring-1 ring-slate-100 transition hover:ring-teal-200"
              >
                <p className="font-semibold text-kbio-navy">{e.name}</p>
                <p className="mt-2 text-sm text-slate-600">{e.role}</p>
              </li>
            ))}
          </ul>
          <div className="mt-12">
            <Link href="/contact" className="text-sm font-semibold text-teal-600 hover:underline">
              Echanger sur votre projet
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
