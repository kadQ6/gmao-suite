import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "K'BIO | Ingénierie biomédicale et architecture hospitalière",
    template: "%s | K'BIO",
  },
  description:
    "Cabinet de conseil en ingenierie biomedicale et architecture hospitaliere. Audits, AMO et pilotage de projets pour etablissements de sante en France et a l'international.",
  metadataBase: new URL("https://kbio-conseil.com"),
  openGraph: {
    title: "K'BIO",
    description:
      "Ingenierie biomedicale et architecture hospitaliere. Audits, AMO et pilotage de projets.",
    url: "https://kbio-conseil.com",
    siteName: "K'BIO",
    locale: "fr_FR",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${inter.variable} ${montserrat.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-white text-slate-900">{children}</body>
    </html>
  );
}
