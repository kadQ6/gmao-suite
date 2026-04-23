import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import Script from "next/script";
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

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${inter.variable} ${montserrat.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-white text-slate-900">
        {children}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
