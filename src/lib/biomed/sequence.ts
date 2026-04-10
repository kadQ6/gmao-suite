import type { Prisma } from "@prisma/client";

/** A appeler dans une transaction : incremente la sequence annuelle (ex. DI-2026-000001). */
export async function nextBiomedSequence(tx: Prisma.TransactionClient, prefix: "DI" | "MC"): Promise<string> {
  const year = new Date().getFullYear();
  const entite = `${prefix}:${year}`;
  const existing = await tx.biomedSequence.findUnique({ where: { entite } });
  const next = (existing?.dernierNumero ?? 0) + 1;
  await tx.biomedSequence.upsert({
    where: { entite },
    create: { entite, annee: year, dernierNumero: next },
    update: { dernierNumero: next },
  });
  return `${prefix}-${year}-${String(next).padStart(6, "0")}`;
}
