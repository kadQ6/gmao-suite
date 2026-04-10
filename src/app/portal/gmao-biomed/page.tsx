import Link from "next/link";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canWriteBiomed } from "@/lib/biomed/rbac";
import { getBiomedDashboardData } from "@/lib/biomed/dashboard";

export const metadata: Metadata = {
  title: "GMAO biomedicale | Portail",
};

const ALERTE_STYLE = {
  danger: "border-red-200 bg-red-50 text-red-800",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  info: "border-sky-200 bg-sky-50 text-sky-900",
} as const;

export default async function GmaoBiomedDashboardPage() {
  const session = await getServerSession(authOptions);
  const canWrite = canWriteBiomed(session?.user.role);
  let data = null;
  try {
    data = await getBiomedDashboardData();
  } catch {
    data = null;
  }

  if (!data) {
    return (
      <section className="rounded-xl border border-amber-200 bg-amber-50/80 p-6 text-sm text-amber-950">
        <p className="font-medium">Donnees indisponibles</p>
        <p className="mt-2">
          Appliquez la migration Prisma du module biomedical puis relancez le seed :{" "}
          <code className="rounded bg-amber-100/80 px-1 font-mono text-xs">npm run db:migrate</code> puis{" "}
          <code className="rounded bg-amber-100/80 px-1 font-mono text-xs">npm run db:seed</code>.
        </p>
      </section>
    );
  }

  const maxEv = Math.max(1, ...data.evolutionDI.map((e) => e.count));

  return (
    <section className="space-y-8">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold text-kbio-navy">Tableau de bord</h1>
          <p className="mt-1 text-sm text-slate-600">
            Parc biomedical, maintenance et stock — donnees stockees dans PostgreSQL (meme base que le portail).
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Exports CSV (compatibles Excel) :{" "}
            <Link
              prefetch={false}
              className="font-medium text-kbio-teal hover:underline"
              href="/api/exports/biomed-equipment"
            >
              equipements
            </Link>
            {" · "}
            <Link
              prefetch={false}
              className="font-medium text-kbio-teal hover:underline"
              href="/api/exports/biomed-interventions"
            >
              demandes d&apos;intervention
            </Link>
            {" · "}
            <Link
              prefetch={false}
              className="font-medium text-kbio-teal hover:underline"
              href="/api/exports/biomed-equipment-template"
            >
              modele import equipement
            </Link>
          </p>
        </div>
        <p className="text-sm text-slate-500">
          {new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {data.alertes.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2">
          {data.alertes.map((a) => (
            <div
              key={a.type + a.message}
              className={`flex items-start gap-3 rounded-xl border p-3 text-sm font-medium ${ALERTE_STYLE[a.niveau]}`}
            >
              <span className="shrink-0" aria-hidden>
                !
              </span>
              {a.message}
            </div>
          ))}
        </div>
      ) : null}

      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Parc equipements</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat href="/portal/gmao-biomed/equipements" label="Total" value={data.equipements.total} />
          <Stat label="En service" value={data.equipements.actifs} sub={`${data.indicateurs.tauxDisponibilite}% dispo.`} />
          <Stat href="/portal/gmao-biomed/interventions" label="En panne" value={data.equipements.enPanne} />
          <Stat label="En maintenance" value={data.equipements.enMaintenance} />
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Maintenance</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat
            href="/portal/gmao-biomed/interventions"
            label="DI ouvertes"
            value={data.interventions.ouvertes}
            sub={`${data.interventions.mois} ce mois`}
          />
          <Stat
            href="/portal/gmao-biomed/maintenance/preventive"
            label="MP en retard"
            value={data.preventif.enRetard}
          />
          <Stat label="MP a venir (30j)" value={data.preventif.aVenir} />
          <Stat label="Taux realisation MP" value={`${data.preventif.tauxRealisation}%`} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Stat
          href="/portal/gmao-biomed/controles-qualite"
          label="CQ a planifier (30j)"
          value={data.controleQualite.aVenir}
        />
        <Stat
          href="/portal/gmao-biomed/stock/pieces"
          label="Stock critique"
          value={data.stock.critique}
        />
        <Stat label="Disponibilite globale" value={`${data.indicateurs.tauxDisponibilite}%`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h3 className="font-semibold text-slate-900">Evolution des demandes d&apos;intervention (6 mois)</h3>
          <div className="mt-6 flex h-48 items-end gap-2">
            {data.evolutionDI.map((e) => (
              <div key={e.mois} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full max-w-[3rem] rounded-t-md bg-kbio-navy/90 transition-all"
                  style={{ height: `${(e.count / maxEv) * 100}%`, minHeight: e.count > 0 ? "4px" : "0" }}
                  title={`${e.count}`}
                />
                <span className="text-center text-[10px] text-slate-500">{e.mois}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-900">Top pannes (12 mois)</h3>
          <ul className="mt-4 space-y-3 text-sm">
            {data.top5Pannes.length === 0 ? (
              <li className="text-slate-500">Aucune donnee.</li>
            ) : (
              data.top5Pannes.map((t, i) => (
                <li key={i} className="border-b border-slate-100 pb-2 last:border-0">
                  <p className="font-medium text-slate-800">{t.designation}</p>
                  <p className="text-xs text-slate-500">
                    {[t.marque, t.modele].filter(Boolean).join(" · ") || "—"} · {t.count} MC
                  </p>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      {data.coutParSite.length > 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-900">Couts MC par site (mois en cours)</h3>
          <ul className="mt-3 divide-y divide-slate-100 text-sm">
            {data.coutParSite.map((c) => (
              <li key={c.siteCode} className="flex justify-between py-2">
                <span className="text-slate-700">
                  {c.siteNom}{" "}
                  <span className="text-slate-400">({c.siteCode})</span>
                </span>
                <span className="font-medium tabular-nums text-slate-900">
                  {c.coutTotal.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {canWrite ? (
        <p className="text-sm">
          <Link
            href="/portal/gmao-biomed/equipements/nouveau"
            className="font-medium text-kbio-teal hover:underline"
          >
            Enregistrer un equipement
          </Link>
        </p>
      ) : null}
    </section>
  );
}

function Stat({
  label,
  value,
  sub,
  href,
}: {
  label: string;
  value: number | string;
  sub?: string;
  href?: string;
}) {
  const inner = (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
      {sub ? <p className="mt-1 text-xs text-slate-500">{sub}</p> : null}
    </article>
  );
  if (href) {
    return (
      <Link href={href} className="block">
        {inner}
      </Link>
    );
  }
  return inner;
}
