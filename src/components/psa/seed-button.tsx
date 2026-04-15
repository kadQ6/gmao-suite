"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SeedButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleSeed() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/psa-rwanda/seed", { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        setResult(
          `${data.summary.sites} sites, ${data.summary.equipements} équipements, ${data.summary.maintenances} maintenances, ${data.summary.piecesDetachees} pièces injectés.`
        );
        router.refresh();
      } else {
        setResult("Erreur lors du seed.");
      }
    } catch {
      setResult("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleSeed}
        disabled={loading}
        className="portal-btn-primary"
      >
        {loading ? "Injection en cours..." : "Injecter les données de démonstration"}
      </button>
      {result && (
        <p className="text-sm text-emerald-700 font-medium">{result}</p>
      )}
    </div>
  );
}
