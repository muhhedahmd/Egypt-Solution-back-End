/*
  Warnings:

  - You are about to drop the column `productId` on the `product_images` table. All the data in the column will be lost.
  - You are about to drop the column `options` on the `product_variants` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `product_variants` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `products` table. All the data in the column will be lost.
  - Added the required column `ProductColorId` to the `product_images` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "providerSession" AS ENUM ('GOOGLE', 'CREDENTIALS', 'FACEBOOK', 'GITHUB');

-- CreateEnum
CREATE TYPE "ProductSizeValue" AS ENUM ('XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'SIZE_28', 'SIZE_30', 'SIZE_32', 'SIZE_34', 'SIZE_36', 'SIZE_38', 'SIZE_40', 'SIZE_42');

-- DropForeignKey
ALTER TABLE "product_images" DROP CONSTRAINT "product_images_productId_fkey";

-- AlterTable
ALTER TABLE "product_images" DROP COLUMN "productId",
ADD COLUMN     "ProductColorId" TEXT NOT NULL,
ADD COLUMN     "isThumbnail" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "product_variants" DROP COLUMN "options",
DROP COLUMN "quantity";

-- AlterTable
ALTER TABLE "products" DROP COLUMN "quantity";

-- CreateTable
CREATE TABLE "ProductColor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "isThumbnail" BOOLEAN NOT NULL DEFAULT false,
    "ProductVariantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductColor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_sizes" (
    "id" TEXT NOT NULL,
    "size" "ProductSizeValue" NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "ProductColorId" TEXT NOT NULL,

    CONSTRAINT "product_sizes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProductColor" ADD CONSTRAINT "ProductColor_ProductVariantId_fkey" FOREIGN KEY ("ProductVariantId") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_sizes" ADD CONSTRAINT "product_sizes_ProductColorId_fkey" FOREIGN KEY ("ProductColorId") REFERENCES "ProductColor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_ProductColorId_fkey" FOREIGN KEY ("ProductColorId") REFERENCES "ProductColor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
