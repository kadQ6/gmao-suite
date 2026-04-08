"use client";

import { FormEvent, Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("admin@kbio-conseil.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function safeCallbackUrl(): string {
    const raw = searchParams.get("callbackUrl");
    if (!raw || !raw.startsWith("/")) return "/portal";
    if (raw.startsWith("//")) return "/portal";
    return raw;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.ok) {
      router.push(safeCallbackUrl());
      router.refresh();
      return;
    }

    setError("Identifiants invalides.");
  }

  return (
    <section className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-xl font-semibold text-kbio-navy">Portail client</h1>
      <p className="mt-2 text-sm text-slate-600">
        Connexion securisee : suivi de projets, GMAO et reporting.
      </p>
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Mot de passe</label>
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-kbio-navy px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-kbio-navy/90 disabled:opacity-60"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        <Link href="/" className="font-medium text-kbio-teal hover:underline">
          Retour au site public
        </Link>
      </p>
    </section>
  );
}

export default function LoginPage() {
  return (
    <div className="py-12">
      <Suspense fallback={<p className="text-center text-sm text-slate-500">Chargement...</p>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
