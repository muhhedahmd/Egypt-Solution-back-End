-- AlterTable
ALTER TABLE "services" ALTER COLUMN "name" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "slideshows_isActive_order_idx" ON "slideshows"("isActive", "order");
