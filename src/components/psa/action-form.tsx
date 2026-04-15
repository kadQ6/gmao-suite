"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ActionForm({ equipId }: { equipId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    const body = {
      designation: fd.get("designation"),
      description: fd.get("description") || null,
      priorite: fd.get("priorite"),
      coutEstime: fd.get("coutEstime") || null,
      responsable: fd.get("responsable") || null,
      echeance: fd.get("echeance") || null,
      observations: fd.get("observations") || null,
    };
    await fetch(`/api/psa-rwanda/equipements/${equipId}/actions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy(false);
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="portal-btn-primary text-xs">
        + Ajouter une action
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Action à entreprendre *</label>
          <input name="designation" required className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm" placeholder="Ex: Remplacer vanne..." />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Priorité *</label>
          <select name="priorite" required className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm">
            <option value="CRITIQUE">Critique</option>
            <option value="HAUTE">Haute</option>
            <option value="NORMALE" selected>Normale</option>
            <option value="BASSE">Basse</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Responsable</label>
          <input name="responsable" className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm" placeholder="Nom du technicien" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
        <textarea name="description" rows={2} className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm" placeholder="Détails de l'action..." />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Coût estimé (EUR)</label>
          <input name="coutEstime" type="number" step="0.01" min="0" className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Échéance</label>
          <input name="echeance" type="date" className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Observations</label>
          <input name="observations" className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm" />
        </div>
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
