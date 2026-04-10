import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canWriteBiomed } from "@/lib/biomed/rbac";
import { createBiomedInterventionRequest } from "@/lib/biomed/actions";
import { prisma } from "@/lib/prisma";
import { BiomedInterventionUrgency } from "@prisma/client";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ equipementId?: string }> };

export default async function NouvelleInterventionPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (!canWriteBiomed(session?.user.role)) {
    redirect("/portal/gmao-biomed/interventions");
  }

  const { equipementId: prefillId } = await searchParams;

  const equipements = await prisma.biomedEquipment.findMany({
    orderBy: { numeroGMAO: "asc" },
    select: { id: true, numeroGMAO: true, designation: true },
  });

  return (
    <section className="mx-auto max-w-lg space-y-6">
      <div>
        <Link href="/portal/gmao-biomed/interventions" className="text-sm text-kbio-teal hover:underline">
          ← Demandes d&apos;intervention
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-kbio-navy">Nouvelle demande (DI)</h1>
        <p className="mt-1 text-sm text-slate-600">Declaration de panne ou d&apos;anomalie sur un equipement du parc.</p>
      </div>
      <form
        action={createBiomedInterventionRequest}
        className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label htmlFor="equipementId" className="block text-sm font-medium text-slate-700">
            Equipement *
          </label>
          <select
            id="equipementId"
            name="equipementId"
            required
            defaultValue={prefillId && equipements.some((e) => e.id === prefillId) ? prefillId : ""}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="">—</option>
            {equipements.map((e) => (
              <option key={e.id} value={e.id}>
                {e.numeroGMAO} — {e.designation}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="niveauUrgence" className="block text-sm font-medium text-slate-700">
            Niveau d&apos;urgence
          </label>
          <select
            id="niveauUrgence"
            name="niveauUrgence"
            defaultValue={BiomedInterventionUrgency.NORMAL}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            {Object.values(BiomedInterventionUrgency).map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="demandeurNom" className="block text-sm font-medium text-slate-700">
            Demandeur (optionnel)
          </label>
          <input
            id="demandeurNom"
            name="demandeurNom"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="Nom ou service"
          />
        </div>
        <div>
          <label htmlFor="descriptionPanne" className="block text-sm font-medium text-slate-700">
            Description *
          </label>
          <textarea
            id="descriptionPanne"
            name="descriptionPanne"
            required
            rows={4}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="Symptomes, contexte, messages d'erreur…"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-full bg-kbio-teal py-2.5 text-sm font-medium text-white hover:opacity-90"
        >
          Enregistrer la DI
        </button>
      </form>
    </section>
  );
}
