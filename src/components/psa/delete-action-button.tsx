"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteActionButton({
  actionId,
  equipId,
  siteId,
}: {
  actionId: string;
  equipId: string;
  siteId: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  void equipId;
  void siteId;

  async function handleDelete() {
    if (!confirm("Supprimer cette action ?")) return;
    setBusy(true);
    await fetch("/api/psa-rwanda/actions", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: actionId }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={busy}
      className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
      title="Supprimer"
    >
      {busy ? "..." : "✕"}
    </button>
  );
}
