-- CreateEnum
CREATE TYPE "ProjectPracticeArea" AS ENUM ('BIOMEDICAL_ENGINEERING', 'HOSPITAL_ARCHITECTURE', 'PROJECT_MANAGEMENT', 'OTHER');

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "coverImageUrl" TEXT,
ADD COLUMN     "practiceArea" "ProjectPracticeArea";
