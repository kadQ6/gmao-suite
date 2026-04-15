import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  PsaActionPriority,
  PsaActionStatus,
  PsaEquipmentStatus,
} from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { EquipmentStatusForm } from "@/components/psa/equipment-status-form";
import { MaintenanceForm } from "@/components/psa/maintenance-form";
import { PieceForm } from "@/components/psa/piece-form";
import { DeleteMaintenanceButton } from "@/components/psa/delete-maintenance-button";
import { DeletePieceButton } from "@/components/psa/delete-piece-button";
import { ActionForm } from "@/components/psa/action-form";
import { DeleteActionButton } from "@/components/psa/delete-action-button";

export const dynamic = "force-dynamic";

const eur = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

function statusBadge(s: PsaEquipmentStatus) {
  const base =
    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold border";
  switch (s) {
    case "FONCTIONNEL":
      return `${base} bg-emerald-100 text-emerald-800 border-emerald-300`;
    case "EN_PANNE":
      return `${base} bg-red-100 text-red-800 border-red-300`;
    case "HORS_SERVICE":
      return `${base} bg-red-200 text-red-900 border-red-400`;
    case "EN_ATTENTE":
      return `${base} bg-gray-200 text-gray-700 border-gray-300`;
    default:
      return `${base} bg-slate-100 text-slate-700 border-slate-300`;
  }
}

function statusLabel(s: PsaEquipmentStatus) {
  switch (s) {
    case "FONCTIONNEL":
      return "Fonctionnel";
    case "EN_PANNE":
      return "En panne";
    case "EN_ATTENTE":
      return "En attente";
    case "HORS_SERVICE":
      return "Hors service";
    default:
      return s;
  }
}

function statusDot(s: PsaEquipmentStatus) {
  switch (s) {
    case "FONCTIONNEL":
      return "bg-emerald-500";
    case "EN_PANNE":
      return "bg-red-500";
    case "HORS_SERVICE":
      return "bg-red-700";
    case "EN_ATTENTE":
      return "bg-gray-400";
    default:
      return "bg-slate-400";
  }
}

function priorityBadge(p: PsaActionPriority) {
  const base = "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold";
  switch (p) {
    case "CRITIQUE":
      return `${base} bg-red-100 text-red-800 border border-red-200`;
    case "HAUTE":
      return `${base} bg-orange-100 text-orange-800 border border-orange-200`;
    case "NORMALE":
      return `${base} bg-blue-100 text-blue-800 border border-blue-200`;
    case "BASSE":
      return `${base} bg-slate-100 text-slate-600 border border-slate-200`;
    default:
      return `${base} bg-slate-100 text-slate-600 border border-slate-200`;
  }
}

function priorityLabel(p: PsaActionPriority) {
  switch (p) {
    case "CRITIQUE":
      return "Critique";
    case "HAUTE":
      return "Haute";
    case "NORMALE":
      return "Normale";
    case "BASSE":
      return "Basse";
    default:
      return p;
  }
}

function actionStatusBadge(s: PsaActionStatus) {
  const base = "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold border";
  switch (s) {
    case "A_FAIRE":
      return `${base} bg-amber-50 text-amber-900 border-amber-200`;
    case "EN_COURS":
      return `${base} bg-sky-50 text-sky-800 border-sky-200`;
    case "TERMINE":
      return `${base} bg-emerald-50 text-emerald-800 border-emerald-200`;
    case "ANNULE":
      return `${base} bg-slate-100 text-slate-500 border-slate-200`;
    default:
      return `${base} bg-slate-100 text-slate-600 border-slate-200`;
  }
}

function actionStatusLabel(s: PsaActionStatus) {
  switch (s) {
    case "A_FAIRE":
      return "À faire";
    case "EN_COURS":
      return "En cours";
    case "TERMINE":
      return "Terminé";
    case "ANNULE":
      return "Annulé";
    default:
      return s;
  }
}

function formatDate(d: Date | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default async function PsaEquipmentDetailPage({
  params,
}: {
  params: Promise<{ siteId: string; equipId: string }>;
}) {
  const { siteId, equipId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/rw/login");

  const isAdmin =
    session.user.role === "SUPER_ADMIN" || session.user.role === "ADMIN";

  const eq = await prisma.psaEquipment.findUnique({
    where: { id: equipId },
    include: {
      site: true,
      maintenances: { orderBy: { dateMaintenance: "desc" } },
      piecesBesoins: { orderBy: [{ urgence: "desc" }, { designation: "asc" }] },
      actions: { orderBy: [{ statut: "asc" }, { priorite: "asc" }] },
    },
  });
  if (!eq || eq.siteId !== siteId) notFound();

  const totalMaintenanceDone = eq.maintenances.reduce(
    (s, m) => s + (Number(m.coutTotal) || 0),
    0
  );
  const totalRemediation = eq.actions
    .filter((a) => a.statut !== "TERMINE")
    .reduce((s, a) => s + (Number(a.coutEstime) || 0), 0);
  const totalPiecesNeeded = eq.piecesBesoins.reduce(
    (s, p) => s + (Number(p.prixUnitaire) || 0) * p.quantite,
    0
  );

  return (
    <div className="space-y-6">
      <nav className="text-xs text-slate-500">
        <Link href="/rw" className="text-teal-600 hover:text-[#0a2540]">
          Sites PSA
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/rw/sites/${siteId}`} className="text-teal-600 hover:text-[#0a2540]">
          {eq.site.nom}
        </Link>
        <span className="mx-2">/</span>
        <span className="font-medium text-[#0a2540]">{eq.designation}</span>
      </nav>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className={statusBadge(eq.statut)}>
                <span className={`h-2 w-2 rounded-full ${statusDot(eq.statut)}`} />
                {statusLabel(eq.statut)}
              </span>
              {isAdmin && <EquipmentStatusForm equipId={eq.id} currentStatus={eq.statut} />}
            </div>
            <h2 className="text-xl font-bold text-[#0a2540]">{eq.designation}</h2>
            <p className="font-mono text-sm text-slate-500">{eq.code}</p>
          </div>
          {isAdmin && (
            <Link
              href={`/rw/sites/${siteId}/equipements/${equipId}/edit`}
              className="text-sm font-semibold text-teal-600 hover:text-[#0a2540]"
            >
              Modifier l&apos;équipement →
            </Link>
          )}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Marque</p>
            <p className="font-medium text-slate-800">{eq.marque || "—"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Modèle</p>
            <p className="font-medium text-slate-800">{eq.modele || "—"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">N° série</p>
            <p className="font-mono text-xs text-slate-700">{eq.numeroSerie || "—"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Type</p>
            <p className="font-medium text-slate-800">{eq.type || "—"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Mise en service</p>
            <p className="font-medium text-slate-800">{formatDate(eq.dateMiseEnService)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Fin garantie</p>
            <p className="font-medium text-slate-800">{formatDate(eq.dateFinGarantie)}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs uppercase tracking-wide text-slate-500">Site</p>
            <p className="font-medium text-slate-800">{eq.site.nom}</p>
          </div>
        </div>

        {eq.observation && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <span className="font-semibold">Observation :</span> {eq.observation}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-base font-semibold text-[#0a2540]">Synthèse des coûts</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Maintenance réalisée
            </p>
            <p className="mt-1 text-lg font-bold text-[#0a2540]">{eur(totalMaintenanceDone)}</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Remédiation à prévoir
            </p>
            <p className="mt-1 text-lg font-bold text-[#0a2540]">{eur(totalRemediation)}</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Pièces nécessaires
            </p>
            <p className="mt-1 text-lg font-bold text-[#0a2540]">{eur(totalPiecesNeeded)}</p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="text-base font-semibold text-[#0a2540]">
            Actions à entreprendre ({eq.actions.length})
          </h3>
        </div>
        {isAdmin && (
          <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
            <ActionForm equipId={eq.id} siteId={siteId} />
          </div>
        )}
        {eq.actions.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-slate-500">Aucune action enregistrée.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-2 text-left">Désignation</th>
                  <th className="px-4 py-2 text-left">Description</th>
                  <th className="px-4 py-2 text-center">Priorité</th>
                  <th className="px-4 py-2 text-center">Statut</th>
                  <th className="px-4 py-2 text-right">Coût</th>
                  <th className="px-4 py-2 text-left">Responsable</th>
                  <th className="px-4 py-2 text-left">Échéance</th>
                  {isAdmin && <th className="px-4 py-2" />}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {eq.actions.map((a) => (
                  <tr key={a.id} className="transition-colors hover:bg-slate-50/50">
                    <td className="px-4 py-2 font-medium text-slate-800">{a.designation}</td>
                    <td className="max-w-xs px-4 py-2 text-slate-600">
                      {a.description || "—"}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <span className={priorityBadge(a.priorite)}>{priorityLabel(a.priorite)}</span>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <span className={actionStatusBadge(a.statut)}>{actionStatusLabel(a.statut)}</span>
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums font-medium text-[#0a2540]">
                      {a.coutEstime != null ? eur(Number(a.coutEstime)) : "—"}
                    </td>
                    <td className="px-4 py-2 text-slate-600">{a.responsable || "—"}</td>
                    <td className="px-4 py-2 tabular-nums text-slate-600">{formatDate(a.echeance)}</td>
                    {isAdmin && (
                      <td className="px-4 py-2 text-right">
                        <DeleteActionButton actionId={a.id} equipId={eq.id} siteId={siteId} />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="text-base font-semibold text-[#0a2540]">
            Historique de maintenance ({eq.maintenances.length})
          </h3>
        </div>
        {isAdmin && (
          <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
            <MaintenanceForm equipId={eq.id} siteId={siteId} />
          </div>
        )}
        {eq.maintenances.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-slate-500">
            Aucune maintenance enregistrée.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {eq.maintenances.map((m) => (
              <div key={m.id} className="px-5 py-4 transition-colors hover:bg-slate-50/50">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-slate-500">
                        {formatDate(m.dateMaintenance)}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          m.type === "Préventive"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {m.type}
                      </span>
                      {m.numeroPV && (
                        <span className="font-mono text-xs text-teal-600">{m.numeroPV}</span>
                      )}
                      {m.technicien && (
                        <span className="text-xs text-slate-500">👤 {m.technicien}</span>
                      )}
                      {m.dureeHeures != null && (
                        <span className="text-xs text-slate-500">⏱ {String(m.dureeHeures)} h</span>
                      )}
                      {m.coutTotal != null && (
                        <span className="text-xs font-semibold text-[#0a2540]">
                          {eur(Number(m.coutTotal))}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-800">{m.description}</p>
                    {m.resultat && (
                      <p className="text-xs text-slate-600">
                        <span className="font-medium">Résultat :</span> {m.resultat}
                      </p>
                    )}
                    {m.piecesUtilisees && (
                      <p className="text-xs text-slate-500">
                        <span className="font-medium">Pièces :</span> {m.piecesUtilisees}
                      </p>
                    )}
                    {m.kitMaintenance && (
                      <p className="text-xs text-slate-500">
                        <span className="font-medium">Kit :</span> {m.kitMaintenance}
                      </p>
                    )}
                    {m.observations && (
                      <p className="text-xs italic text-slate-400">{m.observations}</p>
                    )}
                  </div>
                  {isAdmin && (
                    <DeleteMaintenanceButton maintenanceId={m.id} equipId={eq.id} siteId={siteId} />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-4">
          <h3 className="text-base font-semibold text-[#0a2540]">
            Pièces détachées ({eq.piecesBesoins.length})
          </h3>
          {totalPiecesNeeded > 0 && (
            <span className="text-sm font-bold text-[#0a2540]">Total : {eur(totalPiecesNeeded)}</span>
          )}
        </div>
        {isAdmin && (
          <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
            <PieceForm equipId={eq.id} siteId={siteId} />
          </div>
        )}
        {eq.piecesBesoins.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-slate-500">
            Aucune pièce détachée enregistrée.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-2 text-left">Désignation</th>
                  <th className="px-4 py-2 text-left">Réf.</th>
                  <th className="px-4 py-2 text-center">Qté</th>
                  <th className="px-4 py-2 text-right">PU</th>
                  <th className="px-4 py-2 text-right">Total</th>
                  <th className="px-4 py-2 text-center">Urgence</th>
                  <th className="px-4 py-2 text-center">Stock</th>
                  <th className="px-4 py-2 text-left">Fournisseur</th>
                  {isAdmin && <th className="px-4 py-2" />}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {eq.piecesBesoins.map((p) => (
                  <tr
                    key={p.id}
                    className={`transition-colors ${
                      p.urgence ? "bg-red-50/30 hover:bg-red-50" : "hover:bg-slate-50"
                    }`}
                  >
                    <td className="px-4 py-2 font-medium text-slate-800">
                      {p.designation}
                      {p.observations && (
                        <p className="mt-0.5 text-xs text-slate-400">{p.observations}</p>
                      )}
                    </td>
                    <td className="px-4 py-2 font-mono text-xs text-slate-600">{p.reference || "—"}</td>
                    <td className="px-4 py-2 text-center tabular-nums">{p.quantite}</td>
                    <td className="px-4 py-2 text-right tabular-nums">
                      {p.prixUnitaire != null
                        ? eur(Number(p.prixUnitaire))
                        : "—"}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums font-semibold text-[#0a2540]">
                      {p.prixUnitaire != null
                        ? eur(Number(p.prixUnitaire) * p.quantite)
                        : "—"}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {p.urgence ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
                          URGENT
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {p.enStock ? (
                        <span className="text-xs font-medium text-emerald-600">En stock</span>
                      ) : p.commandee ? (
                        <span className="text-xs font-medium text-amber-600">Commandée</span>
                      ) : (
                        <span className="text-xs font-medium text-red-500">Indisponible</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-xs text-slate-500">{p.fournisseur || "—"}</td>
                    {isAdmin && (
                      <td className="px-4 py-2 text-right">
                        <DeletePieceButton pieceId={p.id} equipId={eq.id} siteId={siteId} />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
