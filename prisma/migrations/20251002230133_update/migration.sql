-- DropForeignKey
ALTER TABLE "Clients" DROP CONSTRAINT "Clients_imageId_fkey";

-- DropForeignKey
ALTER TABLE "Services" DROP CONSTRAINT "Services_imageId_fkey";

-- DropForeignKey
ALTER TABLE "SlideShow" DROP CONSTRAINT "SlideShow_imageId_fkey";

-- AddForeignKey
ALTER TABLE "Services" ADD CONSTRAINT "Services_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "images"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SlideShow" ADD CONSTRAINT "SlideShow_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "images"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Clients" ADD CONSTRAINT "Clients_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "images"("id") ON DELETE CASCADE ON UPDATE CASCADE;
