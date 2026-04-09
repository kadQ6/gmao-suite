import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation technique GMAO | Portail",
};

const docs = [
  {
    href: "/portal/docs/gmao-frontend",
    title: "Specification frontend, UX et ecrans",
    desc: "Stack React/Next, architecture modules, layout, pages metier, composants, workflows, MVP et roadmap UI — SPEC-GMAO-FRONTEND v1.0.",
    badge: "Prompt frontend",
  },
  {
    href: "/portal/docs/gmao-backend",
    title: "Specification backend et donnees",
    desc: "Stack API, schema relationnel, numerotation, regles metier, services, endpoints REST, audit, jobs — SPEC-GMAO-BACKEND v1.0 (synthese).",
    badge: "Prompt backend",
  },
] as const;

export default function PortalDocsIndexPage() {
  return (
    <section className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-kbio-teal">K&apos;BIO Conseil</p>
        <h1 className="mt-1 text-2xl font-semibold text-kbio-navy">Documentation technique</h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">
          Espace dedie aux specifications de la future application{" "}
          <strong className="font-medium text-slate-800">GMAO biomedicale multi-sites</strong>, distinct du suivi
          operationnel (projets, equipements, ordres de travail). Ces documents servent de base a l&apos;equipe de
          developpement et evoluent avec le produit.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {docs.map((d) => (
          <Link
            key={d.href}
            href={d.href}
            className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-kbio-teal/40 hover:shadow-md"
          >
            <span className="inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
              {d.badge}
            </span>
            <h2 className="mt-3 text-lg font-semibold text-slate-900 group-hover:text-kbio-navy">{d.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{d.desc}</p>
            <p className="mt-4 text-sm font-medium text-kbio-teal">Ouvrir la specification →</p>
          </Link>
        ))}
      </div>

      <p className="text-xs text-slate-500">
        Les sources complementaires du depot restent disponibles sous{" "}
        <code className="rounded bg-slate-100 px-1">docs/</code> (fichiers Markdown versionnes avec Git).
      </p>
    </section>
  );
}
