import { PortalPrimaryLink } from "@/components/portal/portal-primary-link";
import { getPortalContext } from "@/lib/portal-scope";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ projectId: string }> };

export default async function ProjectAssetsPage({ params }: Props) {
  const { projectId } = await params;
  const ctx = await getPortalContext();

  let assets: Array<{
    id: string;
    code: string;
    name: string;
    category: string;
    location: string | null;
    _count: { workOrders: number };
  }> = [];

  try {
    assets = await prisma.asset.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { workOrders: true } } },
    });
  } catch {
    assets = [];
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Equipements du projet</h2>
          <p className="mt-1 text-sm text-slate-600">
            Liste des equipements rattaches a ce projet uniquement.
          </p>
        </div>
        {ctx.canWrite ? (
          <PortalPrimaryLink href={`/portal/assets/new?projectId=${encodeURIComponent(projectId)}`}>
            Ajouter un equipement
          </PortalPrimaryLink>
        ) : null}
      </div>
      {assets.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
          Aucun equipement rattache a ce projet.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Categorie</th>
                <th className="px-4 py-3">Localisation</th>
                <th className="px-4 py-3">OT</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => (
                <tr key={asset.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium">{asset.code}</td>
                  <td className="px-4 py-3">{asset.name}</td>
                  <td className="px-4 py-3">{asset.category}</td>
                  <td className="px-4 py-3">{asset.location ?? "-"}</td>
                  <td className="px-4 py-3">{asset._count.workOrders}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
