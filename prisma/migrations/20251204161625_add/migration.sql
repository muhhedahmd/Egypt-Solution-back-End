/*
  Warnings:

  - You are about to drop the `Hero` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Hero" DROP CONSTRAINT "Hero_backgroundImageId_fkey";

-- DropTable
DROP TABLE "Hero";

-- CreateTable
CREATE TABLE "heroes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Main Hero',
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "backgroundImageId" TEXT,
    "backgroundColor" TEXT DEFAULT '#f5f5f5',
    "backgroundVideo" TEXT,
    "overlayColor" TEXT,
    "overlayOpacity" DOUBLE PRECISION DEFAULT 0.5,
    "ctaText" TEXT DEFAULT 'Get Started',
    "ctaUrl" TEXT DEFAULT '/contact',
    "ctaVariant" "ButtonVariant" DEFAULT 'PRIMARY',
    "secondaryCtaText" TEXT,
    "secondaryCtaUrl" TEXT,
    "secondaryCtaVariant" "ButtonVariant" DEFAULT 'GHOST',
    "alignment" "TextAlign" DEFAULT 'CENTER',
    "variant" "HeroVariant" NOT NULL DEFAULT 'CENTERED',
    "minHeight" INTEGER DEFAULT 600,
    "titleSize" TEXT DEFAULT '4xl',
    "titleColor" TEXT DEFAULT '#000000',
    "subtitleColor" TEXT DEFAULT '#666666',
    "descriptionColor" TEXT DEFAULT '#888888',
    "showScrollIndicator" BOOLEAN NOT NULL DEFAULT false,
    "customCSS" TEXT,
    "styleOverrides" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "heroes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "heroes" ADD CONSTRAINT "heroes_backgroundImageId_fkey" FOREIGN KEY ("backgroundImageId") REFERENCES "images"("id") ON DELETE SET NULL ON UPDATE CASCADE;
