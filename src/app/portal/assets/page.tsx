import Link from "next/link";
import { PortalPrimaryLink } from "@/components/portal/portal-primary-link";
import { deleteAssetFromForm } from "@/lib/portal-actions";
import { getAssetScopeWhere, getPortalContext } from "@/lib/portal-scope";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AssetsPage() {
  const ctx = await getPortalContext();
  const where = getAssetScopeWhere(ctx);

  let assets: Array<{
    id: string;
    code: string;
    name: string;
    category: string;
    location: string | null;
    project: { id: string; code: string; name: string } | null;
    _count: { workOrders: number };
  }> = [];
  try {
    assets = await prisma.asset.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        project: { select: { id: true, code: true, name: true } },
        _count: { select: { workOrders: true } },
      },
    });
  } catch {
    assets = [];
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Equipements</h2>
          <a className="mt-2 inline-block text-sm font-medium text-kbio-teal hover:underline" href="/api/exports/assets">
            Exporter Excel (.csv)
          </a>
        </div>
        {ctx.canWrite ? <PortalPrimaryLink href="/portal/assets/new">Nouvel equipement</PortalPrimaryLink> : null}
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Categorie</th>
              <th className="px-4 py-3">Localisation</th>
              <th className="px-4 py-3">Projet</th>
              <th className="px-4 py-3">OT</th>
              {ctx.canWrite ? <th className="px-4 py-3 text-right">Action</th> : null}
            </tr>
          </thead>
          <tbody>
            {assets.map((asset) => (
              <tr key={asset.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium">{asset.code}</td>
                <td className="px-4 py-3">{asset.name}</td>
                <td className="px-4 py-3">{asset.category}</td>
                <td className="px-4 py-3">{asset.location ?? "-"}</td>
                <td className="px-4 py-3">
                  {asset.project ? (
                    <Link
                      href={`/portal/projects/${asset.project.id}`}
                      className="text-kbio-teal hover:underline"
                    >
                      {asset.project.code}
                    </Link>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3">{asset._count.workOrders}</td>
                {ctx.canWrite ? (
                  <td className="px-4 py-3 text-right">
                    <form action={deleteAssetFromForm}>
                      <input type="hidden" name="assetId" value={asset.id} />
                      <input type="hidden" name="returnTo" value="/portal/assets" />
                      <button type="submit" className="text-sm font-medium text-red-700 hover:underline" onClick={(e) => { if (!confirm("Etes-vous sûr ?")) e.preventDefault(); }}>
                        Supprimer
                      </button>
                    </form>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
