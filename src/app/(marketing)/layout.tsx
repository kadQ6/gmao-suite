import type { Metadata } from "next";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://kbio-conseil.com"),
  title: {
    default: "K'BIO Group | Ingenierie biomedicale et hopitaux",
    template: "%s | K'BIO Group",
  },
  description:
    "K'BIO accompagne hopitaux, cliniques et bailleurs : ingenierie biomedicale, architecture hospitaliere, maintenance, GMAO et pilotage de projets. Conseil et outils pour la sante en Afrique et au-dela.",
  openGraph: {
    type: "website",
    locale: "fr_FR",
  },
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
