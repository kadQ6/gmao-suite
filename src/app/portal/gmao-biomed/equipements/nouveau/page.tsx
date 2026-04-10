import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canWriteBiomed } from "@/lib/biomed/rbac";
import { createBiomedEquipment } from "@/lib/biomed/actions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function NouvelEquipementPage() {
  const session = await getServerSession(authOptions);
  if (!canWriteBiomed(session?.user.role)) {
    redirect("/portal/gmao-biomed/equipements");
  }

  const [familles, sites] = await Promise.all([
    prisma.biomedFamily.findMany({ orderBy: { code: "asc" }, select: { id: true, code: true, nom: true } }),
    prisma.biomedSite.findMany({ where: { actif: true }, orderBy: { code: "asc" }, select: { id: true, code: true, nom: true } }),
  ]);

  return (
    <section className="mx-auto max-w-lg space-y-6">
      <div>
        <Link href="/portal/gmao-biomed/equipements" className="text-sm text-kbio-teal hover:underline">
          ← Parc equipements
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-kbio-navy">Nouvel equipement</h1>
        <p className="mt-1 text-sm text-slate-600">Saisie minimale — completez les fiches ensuite.</p>
      </div>
      <form action={createBiomedEquipment} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <label htmlFor="numeroGMAO" className="block text-sm font-medium text-slate-700">
            Numero GMAO *
          </label>
          <input
            id="numeroGMAO"
            name="numeroGMAO"
            required
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="ex. GMAO-2026-001"
          />
        </div>
        <div>
          <label htmlFor="designation" className="block text-sm font-medium text-slate-700">
            Designation *
          </label>
          <input
            id="designation"
            name="designation"
            required
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="familleId" className="block text-sm font-medium text-slate-700">
            Famille *
          </label>
          <select
            id="familleId"
            name="familleId"
            required
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="">—</option>
            {familles.map((f) => (
              <option key={f.id} value={f.id}>
                {f.code} — {f.nom}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="siteId" className="block text-sm font-medium text-slate-700">
            Site *
          </label>
          <select id="siteId" name="siteId" required className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option value="">—</option>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} — {s.nom}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="w-full rounded-full bg-kbio-teal py-2.5 text-sm font-medium text-white hover:opacity-90"
        >
          Enregistrer
        </button>
      </form>
    </section>
  );
}
