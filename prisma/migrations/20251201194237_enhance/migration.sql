/*
  Warnings:

  - Made the column `subject` on table `contacts` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "ContactPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "ContactCategory" AS ENUM ('GENERAL_INQUIRY', 'SUPPORT', 'SALES', 'PARTNERSHIP', 'FEEDBACK', 'COMPLAINT', 'SERVICE_INQUIRY', 'OTHER');

-- AlterTable
ALTER TABLE "contacts" ADD COLUMN     "budget" TEXT,
ADD COLUMN     "category" "ContactCategory" NOT NULL DEFAULT 'GENERAL_INQUIRY',
ADD COLUMN     "priority" "ContactPriority" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "readAt" TIMESTAMP(3),
ADD COLUMN     "referrer" TEXT,
ADD COLUMN     "respondedBy" TEXT,
ADD COLUMN     "response" TEXT,
ADD COLUMN     "serviceId" TEXT,
ADD COLUMN     "source" TEXT,
ADD COLUMN     "timeline" TEXT,
ADD COLUMN     "viewCount" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "subject" SET NOT NULL;

-- CreateIndex
CREATE INDEX "contacts_priority_idx" ON "contacts"("priority");

-- CreateIndex
CREATE INDEX "contacts_category_idx" ON "contacts"("category");

-- CreateIndex
CREATE INDEX "contacts_serviceId_idx" ON "contacts"("serviceId");

-- CreateIndex
CREATE INDEX "contacts_email_idx" ON "contacts"("email");

-- CreateIndex
CREATE INDEX "contacts_resolved_idx" ON "contacts"("resolved");

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;
