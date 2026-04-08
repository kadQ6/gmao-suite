import Link from "next/link";
import { PortalPrimaryLink } from "@/components/portal/portal-primary-link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AssetsPage() {
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
        <h2 className="text-xl font-semibold">Equipements</h2>
        <PortalPrimaryLink href="/portal/assets/new">Nouvel equipement</PortalPrimaryLink>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
