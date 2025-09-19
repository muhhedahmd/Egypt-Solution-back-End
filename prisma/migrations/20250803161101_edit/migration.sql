-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ProductSizeValue" ADD VALUE 'SIZE_44';
ALTER TYPE "ProductSizeValue" ADD VALUE 'SIZE_46';
ALTER TYPE "ProductSizeValue" ADD VALUE 'SIZE_48';
ALTER TYPE "ProductSizeValue" ADD VALUE 'SIZE_50';
ALTER TYPE "ProductSizeValue" ADD VALUE 'SIZE_52';
ALTER TYPE "ProductSizeValue" ADD VALUE 'SIZE_54';
ALTER TYPE "ProductSizeValue" ADD VALUE 'SIZE_56';
ALTER TYPE "ProductSizeValue" ADD VALUE 'SIZE_58';
ALTER TYPE "ProductSizeValue" ADD VALUE 'SIZE_60';
ALTER TYPE "ProductSizeValue" ADD VALUE 'CUSTOM';
ALTER TYPE "ProductSizeValue" ADD VALUE 'EU_36';
ALTER TYPE "ProductSizeValue" ADD VALUE 'EU_37';
ALTER TYPE "ProductSizeValue" ADD VALUE 'EU_38';
ALTER TYPE "ProductSizeValue" ADD VALUE 'EU_39';
ALTER TYPE "ProductSizeValue" ADD VALUE 'EU_40';
ALTER TYPE "ProductSizeValue" ADD VALUE 'EU_41';
ALTER TYPE "ProductSizeValue" ADD VALUE 'EU_42';
ALTER TYPE "ProductSizeValue" ADD VALUE 'EU_43';
ALTER TYPE "ProductSizeValue" ADD VALUE 'EU_44';
ALTER TYPE "ProductSizeValue" ADD VALUE 'EU_45';
ALTER TYPE "ProductSizeValue" ADD VALUE 'EU_46';
ALTER TYPE "ProductSizeValue" ADD VALUE 'US_6';
ALTER TYPE "ProductSizeValue" ADD VALUE 'US_7';
ALTER TYPE "ProductSizeValue" ADD VALUE 'US_8';
ALTER TYPE "ProductSizeValue" ADD VALUE 'US_9';
ALTER TYPE "ProductSizeValue" ADD VALUE 'US_10';
ALTER TYPE "ProductSizeValue" ADD VALUE 'US_11';
ALTER TYPE "ProductSizeValue" ADD VALUE 'US_12';
