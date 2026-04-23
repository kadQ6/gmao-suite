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
    "Cabinet de conseil en ingénierie biomédicale et architecture hospitalière. Audits, AMO et pilotage de projets pour établissements de santé en France et à l'international.",
  metadataBase: new URL("https://kbio-conseil.com"),
  icons: {
    icon: [
      { url: "/brand/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/brand/icon-180.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/brand/icon-32.png",
  },
  openGraph: {
    title: "K'BIO",
    description:
      "Ingénierie biomédicale et architecture hospitalière. Audits, AMO et pilotage de projets.",
    url: "https://kbio-conseil.com",
    siteName: "K'BIO",
    locale: "fr_FR",
    type: "website",
    images: [{ url: "/brand/logo-kbio.png", width: 1200, height: 630 }],
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
