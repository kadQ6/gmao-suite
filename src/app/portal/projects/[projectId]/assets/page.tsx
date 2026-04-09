import { RemarkTab } from "@prisma/client";
import { ConfirmSubmitButton } from "@/components/portal/confirm-submit-button";
import { ProjectRemarks } from "@/components/portal/project-remarks";
import { PortalPrimaryLink } from "@/components/portal/portal-primary-link";
import { deleteAssetFromForm } from "@/lib/portal-actions";
import { getPortalContext } from "@/lib/portal-scope";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ remarkErr?: string; remarkOk?: string }>;
};

export default async function ProjectAssetsPage({ params, searchParams }: Props) {
  const { projectId } = await params;
  const sp = await searchParams;
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
      where: { projectId, archivedAt: null },
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
          <a
            className="mt-2 inline-block text-sm font-medium text-kbio-teal hover:underline"
            href={`/api/exports/assets?projectId=${encodeURIComponent(projectId)}`}
          >
            Exporter Excel (.csv)
          </a>
          {ctx.canWrite ? (
            <a
              className="ml-4 mt-2 inline-block text-sm font-medium text-kbio-teal hover:underline"
              href={`/portal/assets/import?returnTo=${encodeURIComponent(`/portal/projects/${projectId}/assets`)}&projectId=${encodeURIComponent(projectId)}`}
            >
              Importer CSV
            </a>
          ) : null}
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
                  <td className="px-4 py-3">{asset._count.workOrders}</td>
                  {ctx.canWrite ? (
                    <td className="px-4 py-3 text-right">
                      <form action={deleteAssetFromForm}>
                        <input type="hidden" name="assetId" value={asset.id} />
                        <input type="hidden" name="returnTo" value={`/portal/projects/${projectId}/assets`} />
                        <ConfirmSubmitButton className="text-sm font-medium text-red-700 hover:underline">
                          Supprimer
                        </ConfirmSubmitButton>
                      </form>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {sp.remarkErr ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          Remarque invalide. Verifiez le contenu puis recommencez.
        </p>
      ) : null}
      {sp.remarkOk === "1" ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Remarque ajoutee.
        </p>
      ) : null}
      <ProjectRemarks
        projectId={projectId}
        tab={RemarkTab.ASSETS}
        returnTo={`/portal/projects/${projectId}/assets`}
      />
    </section>
  );
}
