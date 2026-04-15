"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteMaintenanceButton({
  maintenanceId,
  equipId,
  siteId,
}: {
  maintenanceId: string;
  equipId: string;
  siteId: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  void equipId;
  void siteId;

  async function handleDelete() {
    if (!confirm("Supprimer cette maintenance ?")) return;
    setBusy(true);
    await fetch(`/api/psa-rwanda/maintenance/${maintenanceId}`, { method: "DELETE" });
    setBusy(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={busy}
      className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
      title="Supprimer"
    >
      {busy ? "..." : "✕"}
    </button>
  );
}
