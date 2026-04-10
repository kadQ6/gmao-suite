import Link from "next/link";
import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";
import { Activity, Beaker, FolderKanban, LayoutDashboard, Wrench } from "lucide-react";

export const metadata: Metadata = {
  title: "Espace client | Portail",
};

export default function PortalClientHubPage() {
  return (
    <section className="space-y-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-kbio-teal">Portail</p>
        <h1 className="mt-1 text-2xl font-semibold text-kbio-navy">Espace client</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Acces centralise au <strong className="font-medium text-slate-800">suivi de projet</strong> (taches,
          livrables, GMAO par projet) et a la <strong className="font-medium text-slate-800">GMAO biomedicale</strong>{" "}
          multi-sites (parc, interventions, maintenance, stock).
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Link
          href="/portal/projects"
          className="group flex flex-col rounded-2xl border-2 border-slate-200 bg-white p-8 shadow-sm transition hover:border-kbio-teal/50 hover:shadow-md"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <FolderKanban className="h-6 w-6" aria-hidden />
          </span>
          <h2 className="mt-5 text-xl font-semibold text-kbio-navy group-hover:text-kbio-teal">
            Suivi de projet
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Projets, taches, equipements rattaches aux projets, ordres de travail et import GMAO par projet.
          </p>
          <span className="mt-6 text-sm font-semibold text-kbio-teal">Ouvrir les projets →</span>
        </Link>

        <Link
          href="/portal/gmao-biomed"
          className="group flex flex-col rounded-2xl border-2 border-slate-200 bg-white p-8 shadow-sm transition hover:border-kbio-teal/50 hover:shadow-md"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
            <Beaker className="h-6 w-6" aria-hidden />
          </span>
          <h2 className="mt-5 text-xl font-semibold text-kbio-navy group-hover:text-kbio-teal">
            GMAO biomedicale
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Parc biomedical, demandes d&apos;intervention, maintenance preventive et curative, controle qualite,
            stock et achats — donnees dediees dans la base portail.
          </p>
          <span className="mt-6 text-sm font-semibold text-kbio-teal">Ouvrir la GMAO →</span>
        </Link>
      </div>

      <div className="rounded-xl border border-amber-200/80 bg-amber-50/60 p-5 text-sm text-amber-950">
        <p className="font-semibold text-amber-900">Evolutions prevues (GMAO bio.)</p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-amber-900/90">
          <li>Import de masse (Excel / CSV) aligne sur les modeles d&apos;export</li>
          <li>Suppressions et archives sur les autres entites (DI, stock, etc.)</li>
          <li>Exports XLSX natifs en complement des CSV deja disponibles</li>
        </ul>
        <p className="mt-3 text-xs text-amber-800/80">
          Deja disponible : creation d&apos;equipements, de DI, enregistrement MC, export CSV du parc (ouvrable dans
          Excel) depuis la liste equipements.
        </p>
      </div>

      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Raccourcis transversaux</h2>
        <ul className="mt-4 flex flex-wrap gap-3">
          <Shortcut href="/portal/assets" icon={Wrench} label="Parc equipements (transversal)" />
          <Shortcut href="/portal/work-orders" icon={Activity} label="Ordres de travail" />
          <Shortcut href="/portal" icon={LayoutDashboard} label="Tableau de bord portail" />
        </ul>
      </div>
    </section>
  );
}

function Shortcut({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon?: LucideIcon;
}) {
  return (
    <li>
      <Link
        href={href}
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-kbio-teal/40 hover:text-kbio-navy"
      >
        {Icon ? <Icon className="h-4 w-4 text-kbio-teal" aria-hidden /> : null}
        {label}
      </Link>
    </li>
  );
}
