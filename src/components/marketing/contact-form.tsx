"use client";

import { FormEvent, useState } from "react";

const infos = [
  {
    label: "Appelez-nous",
    value: "+33 7 69 12 35 58",
    href: "tel:+33769123558",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
        <path d="M22 16.92V20a2 2 0 01-2.18 2A19.86 19.86 0 012 4.18 2 2 0 014 2h3.09a2 2 0 012 1.72c.12.84.33 1.66.61 2.45a2 2 0 01-.45 2.11L8.09 9.46a16 16 0 006.45 6.45l1.18-1.18a2 2 0 012.11-.45c.79.28 1.61.49 2.45.61A2 2 0 0122 16.92z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Email",
    value: "contact@kbio-conseil.com",
    href: "mailto:contact@kbio-conseil.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
        <path d="M3 7l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Bureau",
    value: "114 rue du 1er mai, 01480 Jassans-Riottier",
    href: null as string | null,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
        <path d="M12 22s8-8 8-14a8 8 0 00-16 0c0 6 8 14 8 14z" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="8" r="2.5" />
      </svg>
    ),
  },
];

const team = [
  {
    name: "Kader OMAR",
    role: "Fondateur — Ingénieur biomédical",
    initials: "KO",
    linkedin: "https://www.linkedin.com/in/kader-omar",
  },
  {
    name: "Dagmo MAHDI",
    role: "Ingénieure biomédicale",
    initials: "DM",
    linkedin: null as string | null,
  },
];

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    const form = new FormData(event.currentTarget);
    const payload = {
      name: `${String(form.get("prenom") || "")} ${String(form.get("nom") || "")}`.trim(),
      email: String(form.get("email") || ""),
      organization: "",
      message: String(form.get("message") || ""),
    };
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setStatus(response.ok ? "ok" : "error");
      if (response.ok) (event.target as HTMLFormElement).reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="bg-kbio-surface">
      <div className="mx-auto max-w-6xl px-4 py-16 lg:px-6">
        <div className="grid gap-10 lg:grid-cols-[1fr,1.15fr]">

          {/* Left — Infos + équipe */}
          <div className="space-y-6">

            {/* Coordonnées */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="font-display text-xl font-bold text-kbio-navy">
                Nos coordonnées
              </h2>
              <ul className="mt-7 space-y-6">
                {infos.map((info) => (
                  <li key={info.label} className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-kbio-teal/10 text-kbio-teal">
                      {info.icon}
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                        {info.label}
                      </p>
                      {info.href ? (
                        <a
                          href={info.href}
                          className="mt-1 block text-base font-semibold text-kbio-navy transition hover:text-kbio-teal"
                        >
                          {info.value}
                        </a>
                      ) : (
                        <p className="mt-1 text-base font-semibold text-kbio-navy">{info.value}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-7 border-t border-slate-100 pt-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Suivez-nous
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <a
                    href="https://www.linkedin.com/company/kbio-conseil"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn K'BIO"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0077b5] text-white shadow-sm transition hover:opacity-90"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                  <a
                    href="https://www.facebook.com/kbioconseil"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook K'BIO"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1877f2] text-white shadow-sm transition hover:opacity-90"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Notre équipe */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="font-display text-xl font-bold text-kbio-navy">
                Notre équipe
              </h2>
              <div className="mt-6 space-y-3">
                {team.map((member) => (
                  <div
                    key={member.name}
                    className="flex items-center gap-4 rounded-xl border border-slate-100 bg-kbio-surface p-4 transition hover:border-kbio-teal/30 hover:shadow-sm"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-kbio-navy to-[#0a5591] text-sm font-bold text-white shadow-sm">
                      {member.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-kbio-navy">{member.name}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{member.role}</p>
                    </div>
                    {member.linkedin ? (
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`LinkedIn ${member.name}`}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0077b5]/10 text-[#0077b5] transition hover:bg-[#0077b5] hover:text-white"
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                      </a>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Formulaire */}
          <form
            onSubmit={onSubmit}
            className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm lg:p-10"
          >
            <h2 className="font-display text-2xl font-bold text-kbio-navy">
              Envoyez-nous un message
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Les champs marqués d&apos;un <span className="font-semibold text-kbio-accent">*</span> sont obligatoires.
            </p>

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="nom" className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Nom <span className="text-kbio-accent">*</span>
                </label>
                <input
                  id="nom"
                  name="nom"
                  required
                  autoComplete="family-name"
                  placeholder="Votre nom"
                  className="w-full rounded-xl border border-slate-200 bg-kbio-surface px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 transition focus:border-kbio-teal focus:bg-white focus:ring-2 focus:ring-kbio-teal/20"
                />
              </div>
              <div>
                <label htmlFor="prenom" className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Prénom <span className="text-kbio-accent">*</span>
                </label>
                <input
                  id="prenom"
                  name="prenom"
                  required
                  autoComplete="given-name"
                  placeholder="Votre prénom"
                  className="w-full rounded-xl border border-slate-200 bg-kbio-surface px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 transition focus:border-kbio-teal focus:bg-white focus:ring-2 focus:ring-kbio-teal/20"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Adresse e-mail <span className="text-kbio-accent">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="votre@email.com"
                  className="w-full rounded-xl border border-slate-200 bg-kbio-surface px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 transition focus:border-kbio-teal focus:bg-white focus:ring-2 focus:ring-kbio-teal/20"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="message" className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Message <span className="text-kbio-accent">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  placeholder="Décrivez votre contexte, vos objectifs, vos contraintes et votre calendrier…"
                  className="w-full resize-none rounded-xl border border-slate-200 bg-kbio-surface px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 transition focus:border-kbio-teal focus:bg-white focus:ring-2 focus:ring-kbio-teal/20"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    name="privacy"
                    required
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 accent-kbio-teal"
                  />
                  <span className="text-xs leading-relaxed text-slate-500">
                    J&apos;ai lu et j&apos;accepte la{" "}
                    <a href="/politique-confidentialite" className="underline decoration-dotted hover:text-kbio-teal">
                      politique de confidentialité
                    </a>
                    .{" "}<span className="font-semibold text-kbio-accent">*</span>
                  </span>
                </label>
              </div>
            </div>

            {status === "ok" ? (
              <div className="mt-6 flex items-center gap-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 shrink-0">
                  <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Merci ! Votre message a bien été reçu. Nous revenons vers vous rapidement.
              </div>
            ) : null}
            {status === "error" ? (
              <div className="mt-6 flex items-center gap-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 shrink-0">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4m0 4h.01" strokeLinecap="round" />
                </svg>
                Envoi impossible. Réessayez ou écrivez à{" "}
                <a href="mailto:contact@kbio-conseil.com" className="underline">contact@kbio-conseil.com</a>.
              </div>
            ) : null}

            <button
              type="submit"
              disabled={status === "loading"}
              className="mt-7 w-full rounded-full bg-kbio-navy py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#002f5c] active:scale-[0.98] disabled:opacity-60"
            >
              {status === "loading" ? "Envoi en cours…" : "Envoyer le message"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
