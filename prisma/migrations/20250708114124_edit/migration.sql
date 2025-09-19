/*
  Warnings:

  - You are about to drop the column `price` on the `product_variants` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[sku]` on the table `product_sizes` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "product_sizes" ADD COLUMN     "price" DECIMAL(10,2),
ADD COLUMN     "sku" TEXT;

-- AlterTable
ALTER TABLE "product_variants" DROP COLUMN "price";

-- CreateIndex
CREATE UNIQUE INDEX "product_sizes_sku_key" ON "product_sizes"("sku");
