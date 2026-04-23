import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { articles, categoryLabels, categoryColors } from "@/components/marketing/articles";

export const metadata: Metadata = {
  title: "Actualités",
  description:
    "Retrouvez les dernières actualités, retours d'expérience et publications de K'BIO sur l'ingénierie biomédicale et l'architecture hospitalière.",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function ActualitesPage() {
  return (
    <main>
      {/* Hero */}
      <section className="bg-gradient-to-br from-kbio-navy to-[#002f5c] py-20 text-white">
        <div className="mx-auto max-w-5xl px-4 lg:px-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-kbio-teal-light">
            Blog &amp; Actualités
          </p>
          <h1 className="mt-3 text-4xl font-bold leading-tight md:text-5xl">
            Nos publications
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-300">
            Retours d&apos;expérience, méthodes et actualités du cabinet K&apos;BIO sur
            l&apos;ingénierie biomédicale et l&apos;architecture hospitalière.
          </p>
        </div>
      </section>

      {/* Articles */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4 lg:px-6">
          <div className="grid gap-8 md:grid-cols-2">
            {articles.map((article) => (
              <Link
                key={article.slug}
                href={`/actualites/${article.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-kbio-teal/40 hover:shadow-md"
              >
                {article.image && (
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      className="object-cover transition duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-block rounded-full px-3 py-0.5 text-xs font-semibold ${categoryColors[article.category]}`}
                    >
                      {categoryLabels[article.category]}
                    </span>
                    <span className="text-xs text-slate-400">
                      {formatDate(article.date)}
                    </span>
                  </div>
                  <h2 className="mt-3 text-lg font-bold leading-snug text-slate-900 group-hover:text-kbio-teal">
                    {article.title}
                  </h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500">
                    {article.summary}
                  </p>
                  <span className="mt-4 text-sm font-semibold text-kbio-teal group-hover:underline">
                    Lire la suite →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-kbio-surface py-12">
        <div className="mx-auto max-w-3xl px-4 text-center lg:px-6">
          <h2 className="text-xl font-bold text-slate-900">
            Vous souhaitez travailler avec nous ?
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Nos experts sont disponibles pour vous accompagner dans vos projets hospitaliers.
          </p>
          <Link
            href="/contact"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-kbio-navy px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#002f5c]"
          >
            Nous contacter
          </Link>
        </div>
      </section>
    </main>
  );
}
