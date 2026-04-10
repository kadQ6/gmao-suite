import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { BiomedSidebar } from "@/components/portal/biomed/biomed-sidebar";
import { authOptions } from "@/lib/auth";
import {
  canAccessBiomedAdmin,
  canAccessBiomedReports,
  canReadBiomed,
} from "@/lib/biomed/rbac";

export default async function GmaoBiomedLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?callbackUrl=/portal/gmao-biomed");
  if (!canReadBiomed(session.user.role)) redirect("/portal");

  const showReports = canAccessBiomedReports(session.user.role);
  const showAdmin = canAccessBiomedAdmin(session.user.role);

  return (
    <div className="flex min-h-[calc(100vh-8rem)] w-full max-w-none flex-col gap-0 lg:flex-row lg:-mx-6 lg:w-[calc(100%+3rem)]">
      <BiomedSidebar showReports={showReports} showAdmin={showAdmin} />
      <div className="min-w-0 flex-1 space-y-4 px-0 py-4 lg:px-6">
        <nav className="text-xs text-slate-500">
          <Link href="/portal" className="hover:text-kbio-navy">
            Portail
          </Link>
          <span className="mx-2">/</span>
          <span className="font-medium text-slate-700">GMAO biomedicale</span>
        </nav>
        {children}
      </div>
    </div>
  );
}
