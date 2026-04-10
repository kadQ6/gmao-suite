import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canAccessBiomedAdmin } from "@/lib/biomed/rbac";

export const dynamic = "force-dynamic";

export default async function BiomedAdminPage() {
  const session = await getServerSession(authOptions);
  if (!canAccessBiomedAdmin(session?.user.role)) {
    redirect("/portal/gmao-biomed");
  }

  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-kbio-navy">Administration GMAO biomedical</h1>
      <p className="text-sm leading-relaxed text-slate-600">
        Les comptes utilisateurs et roles sont geres par le portail K&apos;BIO (NextAuth). Les numerotations automatiques
        et parametres metier avances de l&apos;ancienne app Express seront reprises ici progressivement (sequences,
        habilitations, etc.).
      </p>
      <p className="text-sm text-slate-500">Connecte : {session?.user?.email}</p>
    </section>
  );
}
