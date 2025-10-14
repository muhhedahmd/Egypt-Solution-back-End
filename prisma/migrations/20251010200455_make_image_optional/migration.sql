-- DropForeignKey
ALTER TABLE "profiles" DROP CONSTRAINT "profiles_avatarId_fkey";

-- AlterTable
ALTER TABLE "Clients" ALTER COLUMN "imageId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Services" ALTER COLUMN "imageId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "SlideShow" ALTER COLUMN "imageId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_avatarId_fkey" FOREIGN KEY ("avatarId") REFERENCES "images"("id") ON DELETE CASCADE ON UPDATE CASCADE;
