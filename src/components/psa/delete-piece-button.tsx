"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeletePieceButton({
  pieceId,
  equipId,
  siteId,
}: {
  pieceId: string;
  equipId: string;
  siteId: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  void equipId;
  void siteId;

  async function handleDelete() {
    if (!confirm("Supprimer cette pièce ?")) return;
    setBusy(true);
    await fetch(`/api/psa-rwanda/pieces`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: pieceId }),
    });
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
