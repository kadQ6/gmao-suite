import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "A propos",
};

const entities = [
  { name: "K'BIO France", role: "Siege et ingenierie" },
  { name: "K'BIO Djibouti", role: "Proximite terrain et projets regionaux" },
  { name: "RIAL Tech", role: "Partenaire technique (a preciser)" },
  { name: "CiMB", role: "Maintenance biomedicale" },
];

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-16 lg:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-kbio-teal">A propos</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-kbio-navy sm:text-4xl">K&apos;BIO Group</h1>
      <p className="mt-6 max-w-3xl text-lg leading-relaxed text-slate-600">
        K&apos;BIO accompagne les acteurs de la sante dans la conception, le deploiement et le pilotage de systemes
        hospitaliers durables. Notre approche combine expertise technique, comprehension du terrain et outils
        numeriques lorsque cela accelere la decision et la conformite.
      </p>

      <div className="mt-14 grid gap-10 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-kbio-navy">Vision</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Des infrastructures et des dispositifs medicaux au service des patients, avec des systemes documentes,
            maintenables et pilotables dans la duree.
          </p>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-kbio-navy">Mission</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Securiser les investissements sante en alignant besoins cliniques, contraintes techniques et realites de
            mise en oeuvre — des ministeres aux equipes hospitalieres.
          </p>
        </section>
      </div>

      <section className="mt-14">
        <h2 className="text-xl font-semibold text-kbio-navy">Presence et entites</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          Structuration indicative : ajuster les descriptions avec vos informations officielles.
        </p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {entities.map((e) => (
            <li key={e.name} className="rounded-xl border border-slate-200 bg-slate-50/80 p-5">
              <p className="font-semibold text-kbio-navy">{e.name}</p>
              <p className="mt-1 text-sm text-slate-600">{e.role}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-14">
        <Link href="/contact" className="text-sm font-semibold text-kbio-teal hover:underline">
          Echanger sur votre projet
        </Link>
      </div>
    </main>
  );
}
