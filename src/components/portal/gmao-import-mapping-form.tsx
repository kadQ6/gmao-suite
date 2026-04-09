"use client";

import { useMemo, useState } from "react";
import { GmaoImportMode, GmaoImportType } from "@prisma/client";

import { gmaoImportSaveMappingAction } from "@/lib/gmao-import-actions";
import type { GmaoTargetField } from "@/lib/gmao-import/field-registry";

type Props = {
  projectId: string;
  batchId: string;
  importType: GmaoImportType;
  headers: string[];
  targetFields: GmaoTargetField[];
  initialMapping: Record<string, string | null>;
  initialMode: GmaoImportMode;
  initialDedupe: string;
};

export function GmaoImportMappingForm({
  projectId,
  batchId,
  importType,
  headers,
  targetFields,
  initialMapping,
  initialMode,
  initialDedupe,
}: Props) {
  const [mapping, setMapping] = useState<Record<string, string | null>>(initialMapping);
  const [mode, setMode] = useState<GmaoImportMode>(initialMode);
  const [dedupe, setDedupe] = useState(initialDedupe);

  const fieldOptions = useMemo(() => {
    const opts = [{ value: "", label: "— Ignorer —" }];
    for (const f of targetFields) {
      opts.push({ value: f.key, label: `${f.label}${f.required ? " *" : ""}` });
    }
    return opts;
  }, [targetFields]);

  return (
    <form action={gmaoImportSaveMappingAction} className="space-y-4">
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="batchId" value={batchId} />
      <input type="hidden" name="mappingJson" value={JSON.stringify(mapping)} />
      <input type="hidden" name="mode" value={mode} />
      <input type="hidden" name="dedupeStrategy" value={dedupe} />

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-3 py-2">Colonne Excel</th>
              <th className="px-3 py-2">Champ application</th>
            </tr>
          </thead>
          <tbody>
            {headers.map((h) => (
              <tr key={h} className="border-t border-slate-100">
                <td className="px-3 py-2 font-medium text-slate-800">{h}</td>
                <td className="px-3 py-2">
                  <select
                    className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
                    value={mapping[h] ?? ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      setMapping((prev) => ({ ...prev, [h]: v === "" ? null : v }));
                    }}
                  >
                    {fieldOptions.map((o) => (
                      <option key={o.value || "ignore"} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Mode d&apos;ecriture</label>
          <select
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={mode}
            onChange={(e) => setMode(e.target.value as GmaoImportMode)}
          >
            <option value={GmaoImportMode.UPSERT}>Upsert (creer ou remplacer champs)</option>
            <option value={GmaoImportMode.MERGE}>Fusion (ne pas ecraser si cellule vide)</option>
            <option value={GmaoImportMode.CREATE_ONLY}>Creation seule</option>
            <option value={GmaoImportMode.UPDATE_ONLY}>Mise a jour seule</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Cle deduplication fichier</label>
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={dedupe}
            onChange={(e) => setDedupe(e.target.value)}
            readOnly={importType === GmaoImportType.EQUIPMENT_INVENTORY}
            title="Pour inventaire equipement : code unique"
          />
        </div>
      </div>

      <button
        type="submit"
        className="rounded-full bg-kbio-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-kbio-navy/90"
      >
        Enregistrer le mapping
      </button>
    </form>
  );
}
