"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

function LoginForm() {
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/rw";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) {
      setError("Email ou mot de passe incorrect.");
      setLoading(false);
    } else {
      window.location.href = callbackUrl;
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0a2540] text-white text-xl font-bold">O₂</div>
          <h1 className="text-2xl font-bold text-[#0a2540]">PSA Rwanda</h1>
          <p className="text-sm text-slate-500 mt-1">Suivi des équipements oxygène</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {error && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-[#0a2540] focus:ring-1 focus:ring-[#0a2540] outline-none" placeholder="admin@kbio-conseil.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-[#0a2540] focus:ring-1 focus:ring-[#0a2540] outline-none" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading} className="w-full rounded-lg bg-[#0a2540] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0d3155] disabled:opacity-60 transition-colors">
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
        <p className="text-center text-xs text-slate-400">K&apos;BIO Conseil — Confidentiel</p>
      </div>
    </div>
  );
}

export default function RwLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center"><p className="text-slate-400">Chargement...</p></div>}>
      <LoginForm />
    </Suspense>
  );
}
