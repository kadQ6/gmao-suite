import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canAccessBiomedReports } from "@/lib/biomed/rbac";

export const dynamic = "force-dynamic";

export default async function BiomedRapportsPage() {
  const session = await getServerSession(authOptions);
  if (!canAccessBiomedReports(session?.user.role)) {
    redirect("/portal/gmao-biomed");
  }

  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-kbio-navy">Rapports & exports</h1>
      <p className="text-sm leading-relaxed text-slate-600">
        Les exports CSV / PDF et tableaux de bord avances seront branches sur ces donnees Prisma (meme module que les
        ecrans liste). Les indicateurs cles sont deja disponibles sur le tableau de bord biomedical.
      </p>
    </section>
  );
}
