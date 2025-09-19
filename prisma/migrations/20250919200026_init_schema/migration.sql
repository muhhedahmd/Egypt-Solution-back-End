/*
  Warnings:

  - The values [CUSTOMER,GUEST] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - The values [FACEBOOK,GITHUB] on the enum `providerSession` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `company` on the `addresses` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `addresses` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `addresses` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `addresses` table. All the data in the column will be lost.
  - You are about to drop the column `orders` on the `analytics` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `images` table. All the data in the column will be lost.
  - You are about to drop the `ProductColor` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `banners` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cart_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `categories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `coupons` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `navigation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `order_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `orders` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `pages` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `payments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product_images` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product_sizes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product_variants` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `products` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `reviews` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `shipments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `store_settings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `wishlist_items` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `AboutId` to the `addresses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('ADMIN');
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'ADMIN';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "providerSession_new" AS ENUM ('GOOGLE', 'CREDENTIALS');
ALTER TYPE "providerSession" RENAME TO "providerSession_old";
ALTER TYPE "providerSession_new" RENAME TO "providerSession";
DROP TYPE "providerSession_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "ProductColor" DROP CONSTRAINT "ProductColor_ProductVariantId_fkey";

-- DropForeignKey
ALTER TABLE "addresses" DROP CONSTRAINT "addresses_userId_fkey";

-- DropForeignKey
ALTER TABLE "banners" DROP CONSTRAINT "banners_imageId_fkey";

-- DropForeignKey
ALTER TABLE "cart_items" DROP CONSTRAINT "cart_items_productId_fkey";

-- DropForeignKey
ALTER TABLE "cart_items" DROP CONSTRAINT "cart_items_productVariantId_fkey";

-- DropForeignKey
ALTER TABLE "cart_items" DROP CONSTRAINT "cart_items_userId_fkey";

-- DropForeignKey
ALTER TABLE "categories" DROP CONSTRAINT "categories_imageId_fkey";

-- DropForeignKey
ALTER TABLE "categories" DROP CONSTRAINT "categories_parentId_fkey";

-- DropForeignKey
ALTER TABLE "navigation" DROP CONSTRAINT "navigation_parentId_fkey";

-- DropForeignKey
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_orderId_fkey";

-- DropForeignKey
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_productId_fkey";

-- DropForeignKey
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_productVariantId_fkey";

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_customerId_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_orderId_fkey";

-- DropForeignKey
ALTER TABLE "product_images" DROP CONSTRAINT "product_images_ProductColorId_fkey";

-- DropForeignKey
ALTER TABLE "product_images" DROP CONSTRAINT "product_images_imageId_fkey";

-- DropForeignKey
ALTER TABLE "product_sizes" DROP CONSTRAINT "product_sizes_ProductColorId_fkey";

-- DropForeignKey
ALTER TABLE "product_variants" DROP CONSTRAINT "product_variants_productId_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_productId_fkey";

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_userId_fkey";

-- DropForeignKey
ALTER TABLE "shipments" DROP CONSTRAINT "shipments_orderId_fkey";

-- DropForeignKey
ALTER TABLE "store_settings" DROP CONSTRAINT "store_settings_bannerId_fkey";

-- DropForeignKey
ALTER TABLE "store_settings" DROP CONSTRAINT "store_settings_logoId_fkey";

-- DropForeignKey
ALTER TABLE "store_settings" DROP CONSTRAINT "store_settings_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "wishlist_items" DROP CONSTRAINT "wishlist_items_productId_fkey";

-- DropForeignKey
ALTER TABLE "wishlist_items" DROP CONSTRAINT "wishlist_items_userId_fkey";

-- AlterTable
ALTER TABLE "addresses" DROP COLUMN "company",
DROP COLUMN "firstName",
DROP COLUMN "lastName",
DROP COLUMN "type",
ADD COLUMN     "AboutId" TEXT NOT NULL,
ADD COLUMN     "CompanyInfo" TEXT;

-- AlterTable
ALTER TABLE "analytics" DROP COLUMN "orders";

-- AlterTable
ALTER TABLE "images" DROP COLUMN "type";

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'ADMIN';

-- DropTable
DROP TABLE "ProductColor";

-- DropTable
DROP TABLE "banners";

-- DropTable
DROP TABLE "cart_items";

-- DropTable
DROP TABLE "categories";

-- DropTable
DROP TABLE "coupons";

-- DropTable
DROP TABLE "navigation";

-- DropTable
DROP TABLE "order_items";

-- DropTable
DROP TABLE "orders";

-- DropTable
DROP TABLE "pages";

-- DropTable
DROP TABLE "payments";

-- DropTable
DROP TABLE "product_images";

-- DropTable
DROP TABLE "product_sizes";

-- DropTable
DROP TABLE "product_variants";

-- DropTable
DROP TABLE "products";

-- DropTable
DROP TABLE "reviews";

-- DropTable
DROP TABLE "shipments";

-- DropTable
DROP TABLE "store_settings";

-- DropTable
DROP TABLE "wishlist_items";

-- DropEnum
DROP TYPE "DiscountType";

-- DropEnum
DROP TYPE "ImageType";

-- DropEnum
DROP TYPE "OrderStatus";

-- DropEnum
DROP TYPE "PaymentStatus";

-- DropEnum
DROP TYPE "ProductSizeValue";

-- DropEnum
DROP TYPE "ProductStatus";

-- DropEnum
DROP TYPE "ShippingStatus";

-- CreateTable
CREATE TABLE "Services" (
    "id" TEXT NOT NULL,
    "description" TEXT,
    "name" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "SlideShow" (
    "id" TEXT NOT NULL,
    "description" TEXT,
    "name" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Clients" (
    "id" TEXT NOT NULL,
    "description" TEXT,
    "name" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "About" (
    "id" TEXT NOT NULL,
    "info" TEXT,
    "phoneNumber" TEXT,
    "Email" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "Services_id_key" ON "Services"("id");

-- CreateIndex
CREATE UNIQUE INDEX "SlideShow_id_key" ON "SlideShow"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Clients_id_key" ON "Clients"("id");

-- CreateIndex
CREATE UNIQUE INDEX "About_id_key" ON "About"("id");

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_AboutId_fkey" FOREIGN KEY ("AboutId") REFERENCES "About"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Services" ADD CONSTRAINT "Services_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "images"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SlideShow" ADD CONSTRAINT "SlideShow_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "images"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Clients" ADD CONSTRAINT "Clients_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "images"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
