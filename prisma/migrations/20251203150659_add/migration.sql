-- CreateEnum
CREATE TYPE "TextAlign" AS ENUM ('LEFT', 'CENTER', 'RIGHT');

-- CreateEnum
CREATE TYPE "ButtonVariant" AS ENUM ('PRIMARY', 'SECONDARY', 'GHOST', 'LINK');

-- CreateEnum
CREATE TYPE "HeroVariant" AS ENUM ('CENTERED', 'SPLIT', 'IMAGE_BACKGROUND', 'MINIMAL');

-- AlterTable
ALTER TABLE "company_info" ADD COLUMN     "fotterText" TEXT,
ADD COLUMN     "logoId" TEXT,
ADD COLUMN     "website" TEXT;

-- CreateTable
CREATE TABLE "Hero" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "backgroundImageId" TEXT,
    "ctaText" TEXT,
    "ctaUrl" TEXT,
    "ctaVariant" "ButtonVariant" DEFAULT 'PRIMARY',
    "alignment" "TextAlign" DEFAULT 'CENTER',
    "variant" "HeroVariant" NOT NULL DEFAULT 'CENTERED',
    "styleOverrides" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Hero_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "company_info" ADD CONSTRAINT "company_info_logoId_fkey" FOREIGN KEY ("logoId") REFERENCES "images"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hero" ADD CONSTRAINT "Hero_backgroundImageId_fkey" FOREIGN KEY ("backgroundImageId") REFERENCES "images"("id") ON DELETE SET NULL ON UPDATE CASCADE;
