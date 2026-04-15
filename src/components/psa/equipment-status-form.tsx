"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PsaEquipmentStatus } from "@prisma/client";

const STATUSES: { value: PsaEquipmentStatus; label: string }[] = [
  { value: "FONCTIONNEL", label: "Fonctionnel" },
  { value: "EN_PANNE", label: "En panne" },
  { value: "EN_ATTENTE", label: "En attente" },
  { value: "HORS_SERVICE", label: "Hors service" },
];

export function EquipmentStatusForm({
  equipId,
  currentStatus,
}: {
  equipId: string;
  currentStatus: PsaEquipmentStatus;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value as PsaEquipmentStatus;
    if (val === currentStatus) return;
    setBusy(true);
    await fetch(`/api/psa-rwanda/equipements/${equipId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statut: val }),
    });
    setBusy(false);
    router.refresh();
  }

  const selectColor =
    currentStatus === "FONCTIONNEL"
      ? "border-emerald-300 text-emerald-800 bg-emerald-50"
      : currentStatus === "EN_PANNE" || currentStatus === "HORS_SERVICE"
      ? "border-red-300 text-red-800 bg-red-50"
      : "border-gray-300 text-gray-700 bg-gray-50";

  return (
    <select
      value={currentStatus}
      onChange={onChange}
      disabled={busy}
      className={`rounded-lg border px-2 py-1 text-xs font-medium transition-colors ${selectColor} disabled:opacity-50`}
    >
      {STATUSES.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </select>
  );
}
