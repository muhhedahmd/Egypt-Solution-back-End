/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Clients` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `SlideShow` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Clients` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "About" ADD COLUMN     "Description" TEXT;

-- AlterTable
ALTER TABLE "Clients" ADD COLUMN     "richDescription" TEXT,
ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Services" ADD COLUMN     "richDescription" TEXT;

-- AlterTable
ALTER TABLE "SlideShow" ADD COLUMN     "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Clients_slug_key" ON "Clients"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "SlideShow_slug_key" ON "SlideShow"("slug");
