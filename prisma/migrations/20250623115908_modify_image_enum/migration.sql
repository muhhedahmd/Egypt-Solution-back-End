/*
  Warnings:

  - The values [COVER_IMAGE,STORE_BANNER,BILLBOARD_IMAGE] on the enum `ImageType` will be removed. If these variants are still used in the database, this will fail.
  - The values [SUPER_ADMIN,STORE_OWNER,STORE_ADMIN] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `storeId` on the `analytics` table. All the data in the column will be lost.
  - You are about to drop the column `PageId` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `storeId` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `storeId` on the `coupons` table. All the data in the column will be lost.
  - You are about to drop the column `storeId` on the `navigation` table. All the data in the column will be lost.
  - You are about to drop the column `storeId` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `storeId` on the `pages` table. All the data in the column will be lost.
  - You are about to drop the column `PageId` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `storeId` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `coverId` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `footerLayout` on the `store_settings` table. All the data in the column will be lost.
  - You are about to drop the column `headerLayout` on the `store_settings` table. All the data in the column will be lost.
  - You are about to drop the column `storeId` on the `store_settings` table. All the data in the column will be lost.
  - You are about to drop the column `emailConfirmation` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `isVerfiyForEachDevice` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `billboards` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `stores` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `subscription_plans` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `subscriptions` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[date]` on the table `analytics` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `categories` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `coupons` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `pages` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sku]` on the table `product_variants` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `products` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sku]` on the table `products` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ImageType_new" AS ENUM ('PROFILE_PICTURE', 'PRODUCT_IMAGE', 'PRODUCT_THUMBNAIL', 'CATEGORY_IMAGE', 'BANNER_IMAGE', 'STORE_LOGO', 'OTHER');
ALTER TABLE "images" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "images" ALTER COLUMN "type" TYPE "ImageType_new" USING ("type"::text::"ImageType_new");
ALTER TYPE "ImageType" RENAME TO "ImageType_old";
ALTER TYPE "ImageType_new" RENAME TO "ImageType";
DROP TYPE "ImageType_old";
ALTER TABLE "images" ALTER COLUMN "type" SET DEFAULT 'OTHER';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('ADMIN', 'CUSTOMER', 'GUEST');
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'CUSTOMER';
COMMIT;

-- DropForeignKey
ALTER TABLE "analytics" DROP CONSTRAINT "analytics_storeId_fkey";

-- DropForeignKey
ALTER TABLE "billboards" DROP CONSTRAINT "billboards_imageId_fkey";

-- DropForeignKey
ALTER TABLE "billboards" DROP CONSTRAINT "billboards_storeId_fkey";

-- DropForeignKey
ALTER TABLE "categories" DROP CONSTRAINT "categories_PageId_fkey";

-- DropForeignKey
ALTER TABLE "categories" DROP CONSTRAINT "categories_storeId_fkey";

-- DropForeignKey
ALTER TABLE "coupons" DROP CONSTRAINT "coupons_storeId_fkey";

-- DropForeignKey
ALTER TABLE "navigation" DROP CONSTRAINT "navigation_storeId_fkey";

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_storeId_fkey";

-- DropForeignKey
ALTER TABLE "pages" DROP CONSTRAINT "pages_storeId_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_PageId_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_storeId_fkey";

-- DropForeignKey
ALTER TABLE "profiles" DROP CONSTRAINT "profiles_coverId_fkey";

-- DropForeignKey
ALTER TABLE "store_settings" DROP CONSTRAINT "store_settings_storeId_fkey";

-- DropForeignKey
ALTER TABLE "stores" DROP CONSTRAINT "stores_bannerId_fkey";

-- DropForeignKey
ALTER TABLE "stores" DROP CONSTRAINT "stores_logoId_fkey";

-- DropForeignKey
ALTER TABLE "stores" DROP CONSTRAINT "stores_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_planId_fkey";

-- DropForeignKey
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_userId_fkey";

-- DropIndex
DROP INDEX "analytics_storeId_date_key";

-- DropIndex
DROP INDEX "categories_storeId_slug_key";

-- DropIndex
DROP INDEX "coupons_storeId_code_key";

-- DropIndex
DROP INDEX "pages_storeId_slug_key";

-- DropIndex
DROP INDEX "products_storeId_slug_key";

-- DropIndex
DROP INDEX "store_settings_storeId_key";

-- AlterTable
ALTER TABLE "analytics" DROP COLUMN "storeId";

-- AlterTable
ALTER TABLE "categories" DROP COLUMN "PageId",
DROP COLUMN "storeId";

-- AlterTable
ALTER TABLE "coupons" DROP COLUMN "storeId";

-- AlterTable
ALTER TABLE "navigation" DROP COLUMN "storeId";

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "storeId";

-- AlterTable
ALTER TABLE "pages" DROP COLUMN "storeId";

-- AlterTable
ALTER TABLE "products" DROP COLUMN "PageId",
DROP COLUMN "storeId";

-- AlterTable
ALTER TABLE "profiles" DROP COLUMN "coverId";

-- AlterTable
ALTER TABLE "store_settings" DROP COLUMN "footerLayout",
DROP COLUMN "headerLayout",
DROP COLUMN "storeId",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "allowGuestCheckout" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "bannerId" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'USD',
ADD COLUMN     "email" TEXT,
ADD COLUMN     "logoId" TEXT,
ADD COLUMN     "metaDescription" TEXT,
ADD COLUMN     "metaTitle" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "requireEmailVerification" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "storeDescription" TEXT,
ADD COLUMN     "storeName" TEXT NOT NULL DEFAULT 'My Store',
ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT 'UTC';

-- AlterTable
ALTER TABLE "users" DROP COLUMN "emailConfirmation",
DROP COLUMN "isVerfiyForEachDevice",
ADD COLUMN     "emailConfirmed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isVerifiedForEachDevice" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "billboards";

-- DropTable
DROP TABLE "stores";

-- DropTable
DROP TABLE "subscription_plans";

-- DropTable
DROP TABLE "subscriptions";

-- DropEnum
DROP TYPE "StoreStatus";

-- DropEnum
DROP TYPE "SubscriptionStatus";

-- CreateTable
CREATE TABLE "banners" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageId" TEXT,
    "link" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "banners_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "analytics_date_key" ON "analytics"("date");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "coupons_code_key" ON "coupons"("code");

-- CreateIndex
CREATE UNIQUE INDEX "pages_slug_key" ON "pages"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_sku_key" ON "product_variants"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");

-- AddForeignKey
ALTER TABLE "store_settings" ADD CONSTRAINT "store_settings_logoId_fkey" FOREIGN KEY ("logoId") REFERENCES "images"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_settings" ADD CONSTRAINT "store_settings_bannerId_fkey" FOREIGN KEY ("bannerId") REFERENCES "images"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "banners" ADD CONSTRAINT "banners_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "images"("id") ON DELETE SET NULL ON UPDATE CASCADE;
