"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function MaintenanceForm({ equipId, siteId }: { equipId: string; siteId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    const body = {
      dateMaintenance: fd.get("dateMaintenance"),
      type: fd.get("type"),
      description: fd.get("description"),
      technicien: fd.get("technicien") || null,
      dureeHeures: fd.get("dureeHeures") || null,
      resultat: fd.get("resultat") || null,
      piecesUtilisees: fd.get("piecesUtilisees") || null,
      kitMaintenance: fd.get("kitMaintenance") || null,
      coutTotal: fd.get("coutTotal") || null,
      numeroPV: fd.get("numeroPV") || null,
      observations: fd.get("observations") || null,
    };
    await fetch(`/api/psa-rwanda/equipements/${equipId}/maintenance`, {
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
        + Ajouter une maintenance
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Date *</label>
          <input name="dateMaintenance" type="date" required className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Type *</label>
          <select name="type" required className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm">
            <option value="Préventive">Préventive</option>
            <option value="Corrective">Corrective</option>
            <option value="Contrôle qualité">Contrôle qualité</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Technicien</label>
          <input name="technicien" type="text" placeholder="Nom du technicien" className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Description *</label>
        <textarea name="description" required rows={2} className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm" placeholder="Décrivez l'intervention..." />
      </div>
      <div className="grid gap-3 sm:grid-cols-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Durée (h)</label>
          <input name="dureeHeures" type="number" step="0.5" min="0" className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Coût total (EUR)</label>
          <input name="coutTotal" type="number" step="0.01" min="0" className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">N° PV</label>
          <input name="numeroPV" type="text" placeholder="PV-XXX-2026-001" className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Résultat</label>
          <input name="resultat" type="text" placeholder="Conforme / Non résolu..." className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm" />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Pièces utilisées</label>
          <input name="piecesUtilisees" type="text" className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm" placeholder="Ex: Filtre air, Joint, etc." />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Kit de maintenance</label>
          <input name="kitMaintenance" type="text" className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm" placeholder="Ex: Kit PM-4000h Atlas Copco" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Observations</label>
        <input name="observations" type="text" className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm" />
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
