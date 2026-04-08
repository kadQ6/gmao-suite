import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AssetsPage() {
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
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { workOrders: true } } },
    });
  } catch {
    assets = [];
  }

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Equipements</h2>
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
    </section>
  );
}
