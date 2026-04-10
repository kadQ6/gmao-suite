"use client";

import { deleteBiomedEquipment } from "@/lib/biomed/actions";

type Props = { equipmentId: string; numeroGMAO: string };

export function DeleteBiomedEquipmentForm({ equipmentId, numeroGMAO }: Props) {
  return (
    <form
      action={deleteBiomedEquipment}
      className="inline"
      onSubmit={(e) => {
        if (
          !confirm(
            `Supprimer definitivement l'equipement ${numeroGMAO} ? Les interventions et maintenances liees seront supprimees (cascade).`,
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="equipmentId" value={equipmentId} />
      <button
        type="submit"
        className="inline-flex rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50"
      >
        Supprimer l&apos;equipement
      </button>
    </form>
  );
}
