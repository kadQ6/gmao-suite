import type { Metadata } from "next";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";

export const metadata: Metadata = {
  title: {
    default: "K'BIO | Ingénierie biomédicale et architecture hospitalière",
    template: "%s | K'BIO",
  },
  description:
    "K'BIO accompagne les établissements de santé, ministères et bailleurs : ingénierie biomédicale, architecture hospitalière, AMO et pilotage de projets en France et à l'international.",
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
