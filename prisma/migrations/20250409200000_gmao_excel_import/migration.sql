-- CreateEnum
CREATE TYPE "GmaoImportType" AS ENUM ('EQUIPMENT_INVENTORY', 'MAINTENANCE_PLAN', 'SPARE_STOCK', 'MAINTENANCE_KIT', 'PURCHASE', 'TECHNICIAN', 'SITE', 'HOSPITAL', 'SUPPLIER', 'SERVICE');

-- CreateEnum
CREATE TYPE "GmaoImportBatchStatus" AS ENUM ('UPLOADED', 'MAPPING', 'VALIDATED', 'PREVIEWED', 'RUNNING', 'SUCCESS', 'PARTIAL', 'FAILED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "GmaoImportRowStatus" AS ENUM ('PENDING', 'VALID', 'WARNING', 'ERROR', 'SKIPPED', 'APPLIED');

-- CreateEnum
CREATE TYPE "GmaoImportMode" AS ENUM ('CREATE_ONLY', 'UPDATE_ONLY', 'UPSERT', 'MERGE');

-- CreateTable
CREATE TABLE "GmaoImportTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "projectId" TEXT,
    "importType" "GmaoImportType" NOT NULL,
    "mappingJson" JSONB NOT NULL,
    "dedupeKey" TEXT,
    "headerRow" INTEGER NOT NULL DEFAULT 1,
    "defaultMode" "GmaoImportMode" NOT NULL DEFAULT 'UPSERT',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GmaoImportTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GmaoImportBatch" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "importType" "GmaoImportType" NOT NULL,
    "status" "GmaoImportBatchStatus" NOT NULL DEFAULT 'UPLOADED',
    "fileName" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "sheetName" TEXT,
    "headerRow" INTEGER NOT NULL DEFAULT 1,
    "mappingSnapshotJson" JSONB,
    "mode" "GmaoImportMode" NOT NULL DEFAULT 'UPSERT',
    "dedupeStrategy" TEXT,
    "dryRun" BOOLEAN NOT NULL DEFAULT false,
    "statsJson" JSONB,
    "createdById" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GmaoImportBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GmaoImportRow" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "rowIndex" INTEGER NOT NULL,
    "rawJson" JSONB NOT NULL,
    "normalizedJson" JSONB,
    "status" "GmaoImportRowStatus" NOT NULL DEFAULT 'PENDING',
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "entityId" TEXT,

    CONSTRAINT "GmaoImportRow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GmaoImportTemplate_projectId_idx" ON "GmaoImportTemplate"("projectId");

-- CreateIndex
CREATE INDEX "GmaoImportTemplate_importType_idx" ON "GmaoImportTemplate"("importType");

-- CreateIndex
CREATE INDEX "GmaoImportBatch_projectId_createdAt_idx" ON "GmaoImportBatch"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "GmaoImportBatch_status_idx" ON "GmaoImportBatch"("status");

-- CreateIndex
CREATE UNIQUE INDEX "GmaoImportRow_batchId_rowIndex_key" ON "GmaoImportRow"("batchId", "rowIndex");

-- CreateIndex
CREATE INDEX "GmaoImportRow_batchId_status_idx" ON "GmaoImportRow"("batchId", "status");

-- AddForeignKey
ALTER TABLE "GmaoImportTemplate" ADD CONSTRAINT "GmaoImportTemplate_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GmaoImportTemplate" ADD CONSTRAINT "GmaoImportTemplate_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GmaoImportBatch" ADD CONSTRAINT "GmaoImportBatch_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GmaoImportBatch" ADD CONSTRAINT "GmaoImportBatch_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GmaoImportRow" ADD CONSTRAINT "GmaoImportRow_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "GmaoImportBatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
