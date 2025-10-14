-- DropForeignKey
ALTER TABLE "Services" DROP CONSTRAINT "Services_imageId_fkey";

-- AddForeignKey
ALTER TABLE "Services" ADD CONSTRAINT "Services_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "images"("id") ON DELETE CASCADE ON UPDATE CASCADE;
