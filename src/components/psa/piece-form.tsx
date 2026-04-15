"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function PieceForm({ equipId, siteId }: { equipId: string; siteId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    const body = {
      designation: fd.get("designation"),
      reference: fd.get("reference") || null,
      quantite: fd.get("quantite"),
      prixUnitaire: fd.get("prixUnitaire") || null,
      fournisseur: fd.get("fournisseur") || null,
      urgence: fd.get("urgence") === "on",
      enStock: fd.get("enStock") === "on",
      commandee: fd.get("commandee") === "on",
      observations: fd.get("observations") || null,
    };
    await fetch(`/api/psa-rwanda/equipements/${equipId}/pieces`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy(false);
    setOpen(false);
    void siteId;
    router.refresh();
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="portal-btn-primary text-xs">
        + Ajouter une pièce
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Désignation *</label>
          <input name="designation" required className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm" placeholder="Nom de la pièce" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Référence</label>
          <input name="reference" className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm" placeholder="REF-XXX" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Fournisseur</label>
          <input name="fournisseur" className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm" placeholder="Nom fournisseur" />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Quantité *</label>
          <input name="quantite" type="number" min="1" defaultValue={1} required className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Prix unitaire (EUR)</label>
          <input name="prixUnitaire" type="number" step="0.01" min="0" className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm" />
        </div>
        <div className="flex items-end gap-4">
          <label className="flex items-center gap-1.5 text-xs text-slate-700">
            <input name="urgence" type="checkbox" className="rounded border-slate-300" />
            Urgent
          </label>
          <label className="flex items-center gap-1.5 text-xs text-slate-700">
            <input name="enStock" type="checkbox" className="rounded border-slate-300" />
            En stock
          </label>
          <label className="flex items-center gap-1.5 text-xs text-slate-700">
            <input name="commandee" type="checkbox" className="rounded border-slate-300" />
            Commandée
          </label>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Observations</label>
        <input name="observations" className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm" />
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={busy} className="portal-btn-primary text-xs">
          {busy ? "Enregistrement..." : "Enregistrer"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="portal-btn-secondary text-xs">
          Annuler
        </button>
      </div>
    </form>
  );
}
