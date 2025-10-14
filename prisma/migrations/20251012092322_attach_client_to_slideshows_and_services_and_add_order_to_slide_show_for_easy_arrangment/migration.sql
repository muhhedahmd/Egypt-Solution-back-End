/*
  Warnings:

  - A unique constraint covering the columns `[SlideShowId]` on the table `Services` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `order` to the `SlideShow` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Clients" ADD COLUMN     "link" TEXT;

-- AlterTable
ALTER TABLE "Services" ADD COLUMN     "SlideShowId" TEXT,
ADD CONSTRAINT "Services_pkey" PRIMARY KEY ("id");

-- DropIndex
DROP INDEX "Services_id_key";

-- AlterTable
ALTER TABLE "SlideShow" ADD COLUMN     "order" INTEGER NOT NULL,
ADD CONSTRAINT "SlideShow_pkey" PRIMARY KEY ("id");

-- DropIndex
DROP INDEX "SlideShow_id_key";

-- CreateTable
CREATE TABLE "ServiceSlideShow" (
    "serviceId" TEXT NOT NULL,
    "slideShowId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceSlideShow_pkey" PRIMARY KEY ("serviceId","slideShowId")
);

-- CreateTable
CREATE TABLE "ClietSlideShow" (
    "clientId" TEXT NOT NULL,
    "slideShowId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClietSlideShow_pkey" PRIMARY KEY ("clientId","slideShowId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Services_SlideShowId_key" ON "Services"("SlideShowId");

-- AddForeignKey
ALTER TABLE "ServiceSlideShow" ADD CONSTRAINT "ServiceSlideShow_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceSlideShow" ADD CONSTRAINT "ServiceSlideShow_slideShowId_fkey" FOREIGN KEY ("slideShowId") REFERENCES "SlideShow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClietSlideShow" ADD CONSTRAINT "ClietSlideShow_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClietSlideShow" ADD CONSTRAINT "ClietSlideShow_slideShowId_fkey" FOREIGN KEY ("slideShowId") REFERENCES "SlideShow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
