/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Services` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Services` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imageType` to the `images` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `images` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "imageType" AS ENUM ('PROFILE', 'SERVICE', 'SLIDESHOW', 'CLIENT');

-- AlterTable
ALTER TABLE "Services" ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "images" ADD COLUMN     "imageType" "imageType" NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Services_slug_key" ON "Services"("slug");
