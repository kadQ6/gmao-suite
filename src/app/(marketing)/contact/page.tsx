"use client";

import { FormEvent, useState } from "react";

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name") || ""),
      email: String(form.get("email") || ""),
      organization: String(form.get("organization") || ""),
      message: String(form.get("message") || ""),
    };

    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setStatus(response.ok ? "ok" : "error");
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-16 lg:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-kbio-teal">Contact</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-kbio-navy sm:text-4xl">
        Demander une etude
      </h1>
      <p className="mt-6 max-w-2xl text-slate-600">
        Decrivez votre besoin (contexte, pays, type d&apos;etablissement, delais). Nous vous repondons dans les meilleurs
        delais. Les donnees sont traitees pour traiter votre demande.
      </p>

      <form
        onSubmit={onSubmit}
        className="mt-10 max-w-xl space-y-5 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Nom complet</label>
          <input
            name="name"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            autoComplete="name"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Email professionnel</label>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            autoComplete="email"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Organisation (optionnel)</label>
          <input name="organization" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Message</label>
          <textarea
            name="message"
            required
            rows={6}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Contexte, objectifs, contraintes..."
          />
        </div>
        {status === "ok" ? (
          <p className="text-sm font-medium text-emerald-700">Merci — votre message a bien ete recu.</p>
        ) : null}
        {status === "error" ? (
          <p className="text-sm font-medium text-red-600">Envoi impossible. Verifiez les champs et reessayez.</p>
        ) : null}
        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full rounded-full bg-kbio-navy py-3 text-sm font-semibold text-white transition hover:bg-kbio-navy/90 disabled:opacity-60"
        >
          {status === "loading" ? "Envoi..." : "Envoyer"}
        </button>
      </form>
    </main>
  );
}
