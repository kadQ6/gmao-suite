import type { Metadata } from "next";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";

export const metadata: Metadata = {
  title: {
    default: "K'BIO Group | Ingenierie biomedicale et systemes hospitaliers",
    template: "%s | K'BIO Group",
  },
  description:
    "K'BIO accompagne les etablissements de sante et les bailleurs : ingenierie biomedicale, architecture hospitaliere, maintenance, GMAO et pilotage de projets en Afrique.",
};

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </>
  );
}
