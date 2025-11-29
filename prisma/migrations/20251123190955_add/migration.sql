-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "CompositionType" ADD VALUE 'ZOOM';
ALTER TYPE "CompositionType" ADD VALUE 'PARALLAX';
ALTER TYPE "CompositionType" ADD VALUE 'COVERFLOW';
ALTER TYPE "CompositionType" ADD VALUE 'KEN_BURNS';
ALTER TYPE "CompositionType" ADD VALUE 'FLIP';
ALTER TYPE "CompositionType" ADD VALUE 'CUBE';
ALTER TYPE "CompositionType" ADD VALUE 'AUTO_GRID';
ALTER TYPE "CompositionType" ADD VALUE 'STORY';
ALTER TYPE "CompositionType" ADD VALUE 'FILMSTRIP';
ALTER TYPE "CompositionType" ADD VALUE 'LIGHTBOX';
ALTER TYPE "CompositionType" ADD VALUE 'MARQUEE';
