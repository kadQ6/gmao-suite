import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { articles, getArticle, categoryLabels, categoryColors } from "@/components/marketing/articles";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.summary,
  };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const related = articles.filter(
    (a) => a.slug !== article.slug && a.category === article.category
  ).slice(0, 2);

  return (
    <main>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-kbio-navy to-[#002f5c] py-20 text-white">
        {article.image && (
          <div className="absolute inset-0 opacity-10">
            <Image src={article.image} alt="" fill className="object-cover" />
          </div>
        )}
        <div className="relative mx-auto max-w-3xl px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${categoryColors[article.category]}`}>
              {categoryLabels[article.category]}
            </span>
            <span className="text-sm text-slate-300">{formatDate(article.date)}</span>
          </div>
          <h1 className="mt-4 text-3xl font-bold leading-tight md:text-4xl">
            {article.title}
          </h1>
          <p className="mt-4 text-lg text-slate-300">{article.summary}</p>
        </div>
      </section>

      {/* Body */}
      <section className="py-14">
        <div className="mx-auto max-w-3xl px-4 lg:px-6">
          {article.image && (
            <div className="relative mb-10 h-64 w-full overflow-hidden rounded-2xl">
              <Image
                src={article.image}
                alt={article.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 768px"
                priority
              />
            </div>
          )}
          <div className="space-y-5 text-slate-700">
            {article.body.map((paragraph, i) => (
              <p key={i} className="leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Back */}
          <div className="mt-12 border-t border-slate-100 pt-8">
            <Link
              href="/actualites"
              className="inline-flex items-center gap-2 text-sm font-semibold text-kbio-teal hover:underline"
            >
              ← Retour aux actualités
            </Link>
          </div>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="bg-kbio-surface py-12">
          <div className="mx-auto max-w-5xl px-4 lg:px-6">
            <h2 className="text-lg font-bold text-slate-900">Articles similaires</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {related.map((a) => (
                <Link
                  key={a.slug}
                  href={`/actualites/${a.slug}`}
                  className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-kbio-teal/40 hover:shadow-md"
                >
                  <span className={`inline-block self-start rounded-full px-3 py-0.5 text-xs font-semibold ${categoryColors[a.category]}`}>
                    {categoryLabels[a.category]}
                  </span>
                  <p className="mt-3 font-bold text-slate-900 group-hover:text-kbio-teal">
                    {a.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">{formatDate(a.date)}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
