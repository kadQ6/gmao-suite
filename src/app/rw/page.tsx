import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PsaEquipmentStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SeedButton } from "@/components/psa/seed-button";

export const dynamic = "force-dynamic";

function statusDot(s: PsaEquipmentStatus) {
  if (s === "FONCTIONNEL") return "bg-emerald-500";
  if (s === "EN_PANNE") return "bg-red-500";
  if (s === "HORS_SERVICE") return "bg-red-700";
  return "bg-gray-400";
}

function statusLabel(s: PsaEquipmentStatus) {
  if (s === "FONCTIONNEL") return "Fonctionnel";
  if (s === "EN_PANNE") return "En panne";
  if (s === "EN_ATTENTE") return "En attente";
  if (s === "HORS_SERVICE") return "Hors service";
  return s;
}

export default async function PsaRwandaPage() {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === "SUPER_ADMIN" || session?.user?.role === "ADMIN";

  const sites = await prisma.psaSite.findMany({
    orderBy: { code: "asc" },
    include: {
      equipements: {
        orderBy: { code: "asc" },
        include: {
          _count: { select: { maintenances: true, piecesBesoins: true } },
          piecesBesoins: { select: { quantite: true, prixUnitaire: true, urgence: true } },
        },
      },
    },
  });

  const totalEquip = sites.reduce((a, s) => a + s.equipements.length, 0);
  const totalFonc = sites.reduce((a, s) => a + s.equipements.filter((e) => e.statut === "FONCTIONNEL").length, 0);
  const totalPanne = sites.reduce((a, s) => a + s.equipements.filter((e) => e.statut === "EN_PANNE" || e.statut === "HORS_SERVICE").length, 0);
  const totalAttente = sites.reduce((a, s) => a + s.equipements.filter((e) => e.statut === "EN_ATTENTE").length, 0);

  return (
    <div className="space-y-8">
      {/* Empty state with seed button */}
      {sites.length === 0 && isAdmin && (
        <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#0a2540]/10">
            <span className="text-2xl">🏭</span>
          </div>
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Aucun site PSA configuré</h2>
          <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
            Cliquez ci-dessous pour injecter les données de démonstration des 3 sites PSA audités au Rwanda
            avec leurs équipements, historiques de maintenance et besoins en pièces détachées.
          </p>
          <SeedButton />
        </div>
      )}

      {sites.length === 0 && !isAdmin && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <p className="text-slate-500">Aucune donnée PSA disponible pour le moment.</p>
        </div>
      )}

      {sites.length > 0 && (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Sites audités</p>
              <p className="mt-1 text-3xl font-bold text-[#0a2540]">{sites.length}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Équipements</p>
              <p className="mt-1 text-3xl font-bold text-[#0a2540]">{totalEquip}</p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">Fonctionnels</p>
              <p className="mt-1 text-3xl font-bold text-emerald-700">{totalFonc}</p>
            </div>
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-red-700">En panne / HS</p>
              <p className="mt-1 text-3xl font-bold text-red-700">{totalPanne}</p>
              {totalAttente > 0 && (
                <p className="text-xs text-gray-500 mt-0.5">+ {totalAttente} en attente</p>
              )}
            </div>
          </div>

          {/* Site cards */}
          <div className="grid gap-6 lg:grid-cols-3">
            {sites.map((site) => {
              const fonc = site.equipements.filter((e) => e.statut === "FONCTIONNEL").length;
              const panne = site.equipements.filter((e) => e.statut === "EN_PANNE" || e.statut === "HORS_SERVICE").length;
              const attente = site.equipements.filter((e) => e.statut === "EN_ATTENTE").length;

              const totalCostPieces = site.equipements.reduce((sum, eq) => {
                return sum + eq.piecesBesoins.reduce((s, p) => s + (Number(p.prixUnitaire) || 0) * p.quantite, 0);
              }, 0);
              const urgentPieces = site.equipements.reduce((sum, eq) => {
                return sum + eq.piecesBesoins.filter((p) => p.urgence).length;
              }, 0);

              return (
                <Link
                  key={site.id}
                  href={`/rw/sites/${site.id}`}
                  className="group rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md hover:border-[#0a2540]/30 transition-all duration-200"
                >
                  <div className="p-5 space-y-4">
                    {/* Site header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="inline-block rounded-md bg-[#0a2540]/10 px-2 py-0.5 text-xs font-mono font-bold text-[#0a2540] mb-1">
                          {site.code}
                        </span>
                        <h3 className="text-base font-semibold text-slate-800 group-hover:text-[#0a2540] transition-colors leading-tight">
                          {site.nom}
                        </h3>
                      </div>
                      <span className="text-xs text-slate-400 group-hover:text-teal-600 transition-colors">→</span>
                    </div>

                    {/* Location & capacity */}
                    <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                      {site.localisation && (
                        <span className="inline-flex items-center gap-1">
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          {site.localisation}
                        </span>
                      )}
                      {site.capaciteO2 && (
                        <span className="inline-flex items-center gap-1 text-teal-600 font-medium">
                          O₂ {site.capaciteO2}
                        </span>
                      )}
                    </div>

                    {/* Status bar */}
                    <div className="flex gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        {fonc}
                      </span>
                      {panne > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                          {panne}
                        </span>
                      )}
                      {attente > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                          {attente}
                        </span>
                      )}
                      <span className="ml-auto text-xs text-slate-400">{site.equipements.length} éq.</span>
                    </div>

                    {/* Equipment mini list */}
                    <div className="space-y-1">
                      {site.equipements.map((eq) => (
                        <div key={eq.id} className="flex items-center gap-2 text-xs">
                          <span className={`h-2 w-2 rounded-full flex-shrink-0 ${statusDot(eq.statut)}`} />
                          <span className="truncate text-slate-700">{eq.designation}</span>
                          <span className="ml-auto text-slate-400 flex-shrink-0">{statusLabel(eq.statut)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Pieces cost */}
                    {totalCostPieces > 0 && (
                      <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Pièces nécessaires</span>
                          <span className="font-bold text-[#0a2540]">
                            {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: 0 }).format(totalCostPieces)}
                          </span>
                        </div>
                        {urgentPieces > 0 && (
                          <p className="text-red-600 mt-0.5">{urgentPieces} pièce(s) urgente(s)</p>
                        )}
                      </div>
                    )}
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
