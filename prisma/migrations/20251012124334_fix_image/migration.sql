/*
  Warnings:

  - Added the required column `imageType` to the `images` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `images` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "images" ADD COLUMN     "imageType" "ImageType" NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "images_type_idx" ON "images"("type");
