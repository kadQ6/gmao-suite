"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import { IMG } from "@/lib/marketing-images";

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
    <main className="border-b border-teal-100/80">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-14 lg:grid-cols-2 lg:items-start lg:gap-16 lg:px-6 lg:py-20">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-600">Contact</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-kbio-navy sm:text-4xl lg:text-5xl">
            Demander une etude
          </h1>
          <p className="mt-6 max-w-xl text-slate-600 leading-relaxed">
            Decrivez votre besoin : contexte, pays, type d&apos;etablissement, delais souhaites. Nous revenons vers vous
            avec une proposition de cadrage. Les donnees servent uniquement a traiter votre demande.
          </p>
          <div className="relative mt-10 hidden aspect-[4/3] overflow-hidden rounded-3xl shadow-lg ring-1 ring-slate-200/80 lg:block">
            <Image
              src={IMG.building}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 0vw, 40vw"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-teal-900/30 to-transparent" />
          </div>
        </div>

        <form
          onSubmit={onSubmit}
          className="space-y-5 rounded-2xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/80 p-8 shadow-lg shadow-teal-900/5"
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
          className="w-full rounded-full bg-gradient-to-r from-teal-600 to-cyan-600 py-3.5 text-sm font-semibold text-white shadow-md shadow-teal-900/15 transition hover:brightness-105 disabled:opacity-60"
        >
          {status === "loading" ? "Envoi..." : "Envoyer"}
        </button>
      </form>
      </div>
    </main>
  );
}
