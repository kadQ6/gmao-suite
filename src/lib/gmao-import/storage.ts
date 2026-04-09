import { mkdir } from "node:fs/promises";
import { writeFile } from "node:fs/promises";
import path from "node:path";

const IMPORT_ROOT = path.join(process.cwd(), ".data", "imports");

export function getGmaoImportStorageDir(): string {
  return IMPORT_ROOT;
}

export async function ensureGmaoImportStorage(): Promise<void> {
  await mkdir(IMPORT_ROOT, { recursive: true });
}

export function getGmaoImportFilePath(batchId: string): string {
  return path.join(IMPORT_ROOT, `${batchId}.xlsx`);
}

export async function saveGmaoImportBuffer(batchId: string, buffer: Buffer): Promise<string> {
  await ensureGmaoImportStorage();
  const dest = getGmaoImportFilePath(batchId);
  await writeFile(dest, buffer);
  return dest;
}
