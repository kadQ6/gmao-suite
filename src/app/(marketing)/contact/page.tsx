import type { Metadata } from "next";
import { ContactForm } from "@/components/marketing/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contactez K'BIO pour vos projets d'ingénierie biomédicale et d'architecture hospitalière. Bureau à Jassans-Riottier — interventions France et international.",
};

export default function ContactPage() {
  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-kbio-navy">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15"
          style={{ backgroundImage: "url(/missions/biomedical-pc.webp)" }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-br from-kbio-navy via-kbio-navy/95 to-[#0a5591]/80" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 py-20 lg:px-6 lg:py-28">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-kbio-teal-light">
            Contact
          </p>
          <h1 className="mt-4 max-w-2xl font-display text-4xl font-bold leading-tight text-white sm:text-5xl">
            Contactez-nous
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-200/90 sm:text-lg">
            Décrivez-nous votre contexte — pays, établissement, calendrier. Nous revenons vers vous
            sous 48 h ouvrées.
          </p>
        </div>
      </section>

      <ContactForm />
    </main>
  );
}
