import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import {
  PsaActionStatus,
  PsaEquipmentStatus,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { SeedButton } from "@/components/psa/seed-button";

export const dynamic = "force-dynamic";

const fmtEur = (n: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);

function statusDot(s: PsaEquipmentStatus) {
  switch (s) {
    case PsaEquipmentStatus.FONCTIONNEL:
      return "bg-emerald-500";
    case PsaEquipmentStatus.EN_PANNE:
    case PsaEquipmentStatus.HORS_SERVICE:
      return "bg-red-500";
    case PsaEquipmentStatus.EN_ATTENTE:
      return "bg-gray-400";
    default:
      return "bg-slate-400";
  }
}

function statusLabel(s: PsaEquipmentStatus) {
  switch (s) {
    case PsaEquipmentStatus.FONCTIONNEL:
      return "Fonctionnel";
    case PsaEquipmentStatus.EN_PANNE:
      return "En panne";
    case PsaEquipmentStatus.EN_ATTENTE:
      return "En attente";
    case PsaEquipmentStatus.HORS_SERVICE:
      return "Hors service";
    default:
      return s;
  }
}

function isPanneOrHs(s: PsaEquipmentStatus) {
  return s === PsaEquipmentStatus.EN_PANNE || s === PsaEquipmentStatus.HORS_SERVICE;
}

export default async function PsaRwandaHomePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/rw/login");
  }

  const isAdmin =
    session.user.role === "SUPER_ADMIN" || session.user.role === "ADMIN";

  const sites = await prisma.psaSite.findMany({
    orderBy: { code: "asc" },
    include: {
      equipements: {
        orderBy: { code: "asc" },
        include: {
          maintenances: true,
          piecesBesoins: true,
          actions: true,
        },
      },
    },
  });

  const allEquip = sites.flatMap((s) => s.equipements);
  const allPieces = allEquip.flatMap((e) => e.piecesBesoins);
  const allActions = allEquip.flatMap((e) => e.actions);

  const totalSites = sites.length;
  const totalEquip = allEquip.length;
  const totalFonc = allEquip.filter(
    (e) => e.statut === PsaEquipmentStatus.FONCTIONNEL
  ).length;
  const totalPanneHs = allEquip.filter((e) => isPanneOrHs(e.statut)).length;
  const totalAttente = allEquip.filter(
    (e) => e.statut === PsaEquipmentStatus.EN_ATTENTE
  ).length;
  const totalPiecesCost = allPieces.reduce(
    (s, p) => s + (Number(p.prixUnitaire) || 0) * p.quantite,
    0
  );
  const totalActionsAFaire = allActions.filter(
    (a) => a.statut === PsaActionStatus.A_FAIRE
  ).length;

  return (
    <div className="space-y-8 text-[#0a2540]">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Sites PSA —{" "}
          <span className="text-teal-600 font-semibold">Rwanda</span>
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Vue d&apos;ensemble des équipements et actions de suivi
        </p>
      </div>

      {sites.length === 0 && isAdmin && (
        <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#0a2540]/10">
            <span className="text-2xl">🏭</span>
          </div>
          <h2 className="mb-2 text-lg font-semibold text-[#0a2540]">
            Aucun site PSA configuré
          </h2>
          <p className="mx-auto mb-6 max-w-md text-sm text-slate-500">
            Cliquez ci-dessous pour injecter les données de démonstration des
            sites PSA audités au Rwanda avec leurs équipements, maintenances,
            besoins en pièces et actions.
          </p>
          <SeedButton />
        </div>
      )}

      {sites.length === 0 && !isAdmin && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <p className="text-slate-500">
            Aucune donnée PSA disponible pour le moment.
          </p>
        </div>
      )}

      {sites.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Sites
              </p>
              <p className="mt-1 text-2xl font-bold tabular-nums">
                {totalSites}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Équipements
              </p>
              <p className="mt-1 text-2xl font-bold tabular-nums">
                {totalEquip}
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
                Fonctionnels
              </p>
              <p className="mt-1 text-2xl font-bold text-emerald-700 tabular-nums">
                {totalFonc}
              </p>
            </div>
            <div className="rounded-2xl border border-red-200 bg-red-50/80 p-4 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-red-700">
                En panne / HS
              </p>
              <p className="mt-1 text-2xl font-bold text-red-700 tabular-nums">
                {totalPanneHs}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-100 p-4 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-600">
                En attente
              </p>
              <p className="mt-1 text-2xl font-bold text-slate-600 tabular-nums">
                {totalAttente}
              </p>
            </div>
            <div className="rounded-2xl border border-teal-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-teal-600">
                Coût pièces (EUR)
              </p>
              <p className="mt-1 text-lg font-bold leading-tight text-[#0a2540]">
                {fmtEur(totalPiecesCost)}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm col-span-2 md:col-span-1 lg:col-span-1 xl:col-span-1">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Actions à faire
              </p>
              <p className="mt-1 text-2xl font-bold text-teal-600 tabular-nums">
                {totalActionsAFaire}
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {sites.map((site) => {
              const fonc = site.equipements.filter(
                (e) => e.statut === PsaEquipmentStatus.FONCTIONNEL
              ).length;
              const panne = site.equipements.filter((e) =>
                isPanneOrHs(e.statut)
              ).length;
              const attente = site.equipements.filter(
                (e) => e.statut === PsaEquipmentStatus.EN_ATTENTE
              ).length;

              const pieceCost = site.equipements.reduce((sum, eq) => {
                return (
                  sum +
                  eq.piecesBesoins.reduce(
                    (s, p) => s + (Number(p.prixUnitaire) || 0) * p.quantite,
                    0
                  )
                );
              }, 0);

              const actionsAFaire = site.equipements.reduce((sum, eq) => {
                return (
                  sum +
                  eq.actions.filter((a) => a.statut === PsaActionStatus.A_FAIRE)
                    .length
                );
              }, 0);

              const locationParts = [site.localisation, site.region].filter(
                Boolean
              );
              const locationLine = locationParts.join(" · ");

              return (
                <Link
                  key={site.id}
                  href={`/rw/sites/${site.id}`}
                  className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-[#0a2540]/25 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className="mb-1 inline-block rounded-md bg-[#0a2540]/10 px-2 py-0.5 font-mono text-xs font-bold text-[#0a2540]">
                        {site.code}
                      </span>
                      <h2 className="mt-1 text-base font-semibold leading-snug text-[#0a2540] transition-colors group-hover:text-teal-600">
                        {site.nom}
                      </h2>
                    </div>
                    <span
                      className="shrink-0 text-teal-600 opacity-70 transition-opacity group-hover:opacity-100"
                      aria-hidden
                    >
                      →
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                    {locationLine && (
                      <span className="inline-flex min-w-0 items-center gap-1">
                        <svg
                          className="h-3.5 w-3.5 shrink-0 text-teal-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                          aria-hidden
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span className="truncate">{locationLine}</span>
                      </span>
                    )}
                    {site.capaciteO2 && (
                      <span className="font-medium text-teal-600">
                        O₂ {site.capaciteO2}
                      </span>
                    )}
                  </div>

                  <div
                    className="mt-4 flex items-center gap-3"
                    title="Répartition par statut"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      <span className="text-xs font-semibold text-emerald-700 tabular-nums">
                        {fonc}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                      <span className="text-xs font-semibold text-red-700 tabular-nums">
                        {panne}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-gray-400" />
                      <span className="text-xs font-semibold text-slate-600 tabular-nums">
                        {attente}
                      </span>
                    </div>
                    <span className="ml-auto text-xs text-slate-400">
                      {site.equipements.length} éq.
                    </span>
                  </div>

                  <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-4">
                    {site.equipements.map((eq) => (
                      <div
                        key={eq.id}
                        className="flex items-center gap-2 text-xs text-slate-700"
                      >
                        <span
                          className={`h-2 w-2 shrink-0 rounded-full ${statusDot(eq.statut)}`}
                          title={statusLabel(eq.statut)}
                        />
                        <span className="min-w-0 truncate font-medium">
                          {eq.designation}
                        </span>
                        <span className="ml-auto shrink-0 text-slate-400">
                          {statusLabel(eq.statut)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto flex flex-wrap items-end justify-between gap-3 border-t border-slate-100 pt-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        Pièces (EUR)
                      </p>
                      <p className="text-sm font-bold text-[#0a2540]">
                        {fmtEur(pieceCost)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        Actions à faire
                      </p>
                      <p className="text-sm font-bold text-teal-600 tabular-nums">
                        {actionsAFaire}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
