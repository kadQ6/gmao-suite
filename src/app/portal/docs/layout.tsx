import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation technique | Portail K'BIO",
  description:
    "Specifications GMAO biomedicale (frontend, backend) pour equipe developpement — espace separe du portail client.",
};

export default function PortalDocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <nav className="text-sm text-slate-500" aria-label="Fil documentation">
        <Link href="/portal" className="font-medium text-kbio-teal hover:underline">
          Portail client
        </Link>
        <span className="mx-2" aria-hidden>
          /
        </span>
        <span className="font-medium text-slate-700">Documentation technique GMAO</span>
      </nav>
      {children}
    </div>
  );
}
