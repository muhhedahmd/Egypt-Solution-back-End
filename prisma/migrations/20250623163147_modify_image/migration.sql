/*
  Warnings:

  - You are about to drop the column `primaryColor` on the `store_settings` table. All the data in the column will be lost.
  - You are about to drop the column `secondaryColor` on the `store_settings` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[ownerId]` on the table `store_settings` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `customId` to the `images` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileHash` to the `images` table without a default value. This is not possible if the table is not empty.
  - Added the required column `key` to the `images` table without a default value. This is not possible if the table is not empty.
  - Added the required column `typeImage` to the `images` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerId` to the `store_settings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "images" ADD COLUMN     "customId" TEXT NOT NULL,
ADD COLUMN     "fileHash" TEXT NOT NULL,
ADD COLUMN     "key" TEXT NOT NULL,
ADD COLUMN     "typeImage" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "store_settings" DROP COLUMN "primaryColor",
DROP COLUMN "secondaryColor",
ADD COLUMN     "ownerId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "store_settings_ownerId_key" ON "store_settings"("ownerId");

-- AddForeignKey
ALTER TABLE "store_settings" ADD CONSTRAINT "store_settings_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
