"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ActionForm({ equipId, siteId }: { equipId: string; siteId: string }) {
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
      statut: fd.get("statut") || "A_FAIRE",
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
    void siteId;
    router.refresh();
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="portal-btn-primary text-xs">
        + Ajouter une action
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-slate-600">Désignation *</label>
          <input
            name="designation"
            type="text"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-slate-600">Description</label>
          <textarea name="description" rows={2} className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Priorité</label>
          <select name="priorite" className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm" defaultValue="NORMALE">
            <option value="CRITIQUE">Critique</option>
            <option value="HAUTE">Haute</option>
            <option value="NORMALE">Normale</option>
            <option value="BASSE">Basse</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Statut</label>
          <select name="statut" className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm" defaultValue="A_FAIRE">
            <option value="A_FAIRE">À faire</option>
            <option value="EN_COURS">En cours</option>
            <option value="TERMINE">Terminé</option>
            <option value="ANNULE">Annulé</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Coût estimé (EUR)</label>
          <input name="coutEstime" type="number" step="0.01" min="0" className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Échéance</label>
          <input name="echeance" type="date" className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm" />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-slate-600">Responsable</label>
          <input name="responsable" type="text" className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm" />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-slate-600">Observations</label>
          <input name="observations" type="text" className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm" />
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
