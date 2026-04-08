import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GMAO Suite",
  description: "Suivi de projet et gestion de maintenance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const navItems = [
    { href: "/", label: "Dashboard" },
    { href: "/projects", label: "Projets" },
    { href: "/tasks", label: "Taches" },
    { href: "/assets", label: "Equipements" },
    { href: "/work-orders", label: "Ordres de travail" },
    { href: "/admin", label: "Admin" },
  ];

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
            <h1 className="text-lg font-semibold">GMAO Suite</h1>
            <nav className="flex items-center gap-4 text-sm">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className="text-slate-600 hover:text-slate-950">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
