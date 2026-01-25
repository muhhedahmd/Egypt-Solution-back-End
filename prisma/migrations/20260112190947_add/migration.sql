/*
  Warnings:

  - You are about to drop the column `views` on the `blogs` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "EnumLang" AS ENUM ('EN', 'AR');

-- AlterTable
ALTER TABLE "blogs" DROP COLUMN "views";

-- AlterTable
ALTER TABLE "company_info" ADD COLUMN     "lang" "EnumLang" NOT NULL DEFAULT 'EN';

-- CreateTable
CREATE TABLE "company_translation" (
    "id" TEXT NOT NULL,
    "lang" "EnumLang" NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT,
    "description" TEXT,
    "footerText" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "metaKeywords" TEXT,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_translation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hero_translation" (
    "id" TEXT NOT NULL,
    "lang" "EnumLang" NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Main Hero',
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "ctaText" TEXT DEFAULT 'Get Started',
    "secondaryCtaText" TEXT,
    "heroId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hero_translation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "header_translation" (
    "id" TEXT NOT NULL,
    "lang" "EnumLang" NOT NULL,
    "siteName" TEXT NOT NULL,
    "tagline" TEXT,
    "headerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "header_translation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_translation" (
    "id" TEXT NOT NULL,
    "lang" "EnumLang" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "richDescription" TEXT,
    "serviceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_translation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "footer_translation" (
    "id" TEXT NOT NULL,
    "lang" "EnumLang" NOT NULL,
    "copyrightText" TEXT NOT NULL,
    "footerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "footer_translation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "footer_column_translation" (
    "id" TEXT NOT NULL,
    "lang" "EnumLang" NOT NULL,
    "title" TEXT NOT NULL,
    "columnId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "footer_column_translation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "footer_link_translation" (
    "id" TEXT NOT NULL,
    "lang" "EnumLang" NOT NULL,
    "label" TEXT NOT NULL,
    "linkId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "footer_link_translation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "header_nav_item_translation" (
    "id" TEXT NOT NULL,
    "lang" "EnumLang" NOT NULL,
    "label" TEXT NOT NULL,
    "navItemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "header_nav_item_translation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_translation" (
    "id" TEXT NOT NULL,
    "lang" "EnumLang" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "richDescription" TEXT,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_translation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "technology_translation" (
    "id" TEXT NOT NULL,
    "lang" "EnumLang" NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "technologyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "technology_translation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_member_translation" (
    "id" TEXT NOT NULL,
    "lang" "EnumLang" NOT NULL,
    "name" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "bio" TEXT,
    "memberId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_member_translation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_translation" (
    "id" TEXT NOT NULL,
    "lang" "EnumLang" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "richDescription" TEXT,
    "industry" TEXT,
    "clientId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_translation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "testimonial_translation" (
    "id" TEXT NOT NULL,
    "lang" "EnumLang" NOT NULL,
    "clientName" TEXT NOT NULL,
    "clientPosition" TEXT,
    "clientCompany" TEXT,
    "content" TEXT NOT NULL,
    "testimonialId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "testimonial_translation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_translation" (
    "id" TEXT NOT NULL,
    "lang" "EnumLang" NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "metaKeywords" TEXT,
    "blogId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_translation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category_translation" (
    "id" TEXT NOT NULL,
    "lang" "EnumLang" NOT NULL,
    "name" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "category_translation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "slideshow_translation" (
    "id" TEXT NOT NULL,
    "lang" "EnumLang" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "slideShowId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "slideshow_translation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "company_translation_companyId_lang_key" ON "company_translation"("companyId", "lang");

-- CreateIndex
CREATE UNIQUE INDEX "hero_translation_heroId_lang_key" ON "hero_translation"("heroId", "lang");

-- CreateIndex
CREATE UNIQUE INDEX "header_translation_headerId_lang_key" ON "header_translation"("headerId", "lang");

-- CreateIndex
CREATE UNIQUE INDEX "service_translation_serviceId_lang_key" ON "service_translation"("serviceId", "lang");

-- CreateIndex
CREATE INDEX "footer_translation_lang_idx" ON "footer_translation"("lang");

-- CreateIndex
CREATE UNIQUE INDEX "footer_translation_footerId_lang_key" ON "footer_translation"("footerId", "lang");

-- CreateIndex
CREATE INDEX "footer_column_translation_lang_idx" ON "footer_column_translation"("lang");

-- CreateIndex
CREATE UNIQUE INDEX "footer_column_translation_columnId_lang_key" ON "footer_column_translation"("columnId", "lang");

-- CreateIndex
CREATE INDEX "footer_link_translation_lang_idx" ON "footer_link_translation"("lang");

-- CreateIndex
CREATE UNIQUE INDEX "footer_link_translation_linkId_lang_key" ON "footer_link_translation"("linkId", "lang");

-- CreateIndex
CREATE INDEX "header_nav_item_translation_lang_idx" ON "header_nav_item_translation"("lang");

-- CreateIndex
CREATE UNIQUE INDEX "header_nav_item_translation_navItemId_lang_key" ON "header_nav_item_translation"("navItemId", "lang");

-- CreateIndex
CREATE INDEX "project_translation_lang_idx" ON "project_translation"("lang");

-- CreateIndex
CREATE UNIQUE INDEX "project_translation_projectId_lang_key" ON "project_translation"("projectId", "lang");

-- CreateIndex
CREATE INDEX "technology_translation_lang_idx" ON "technology_translation"("lang");

-- CreateIndex
CREATE UNIQUE INDEX "technology_translation_technologyId_lang_key" ON "technology_translation"("technologyId", "lang");

-- CreateIndex
CREATE INDEX "team_member_translation_lang_idx" ON "team_member_translation"("lang");

-- CreateIndex
CREATE UNIQUE INDEX "team_member_translation_memberId_lang_key" ON "team_member_translation"("memberId", "lang");

-- CreateIndex
CREATE INDEX "client_translation_lang_idx" ON "client_translation"("lang");

-- CreateIndex
CREATE UNIQUE INDEX "client_translation_clientId_lang_key" ON "client_translation"("clientId", "lang");

-- CreateIndex
CREATE INDEX "testimonial_translation_lang_idx" ON "testimonial_translation"("lang");

-- CreateIndex
CREATE UNIQUE INDEX "testimonial_translation_testimonialId_lang_key" ON "testimonial_translation"("testimonialId", "lang");

-- CreateIndex
CREATE INDEX "blog_translation_lang_idx" ON "blog_translation"("lang");

-- CreateIndex
CREATE UNIQUE INDEX "blog_translation_blogId_lang_key" ON "blog_translation"("blogId", "lang");

-- CreateIndex
CREATE INDEX "category_translation_lang_idx" ON "category_translation"("lang");

-- CreateIndex
CREATE UNIQUE INDEX "category_translation_categoryId_lang_key" ON "category_translation"("categoryId", "lang");

-- CreateIndex
CREATE INDEX "slideshow_translation_lang_idx" ON "slideshow_translation"("lang");

-- CreateIndex
CREATE UNIQUE INDEX "slideshow_translation_slideShowId_lang_key" ON "slideshow_translation"("slideShowId", "lang");

-- AddForeignKey
ALTER TABLE "company_translation" ADD CONSTRAINT "company_translation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company_info"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hero_translation" ADD CONSTRAINT "hero_translation_heroId_fkey" FOREIGN KEY ("heroId") REFERENCES "heroes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "header_translation" ADD CONSTRAINT "header_translation_headerId_fkey" FOREIGN KEY ("headerId") REFERENCES "headers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_translation" ADD CONSTRAINT "service_translation_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "footer_translation" ADD CONSTRAINT "footer_translation_footerId_fkey" FOREIGN KEY ("footerId") REFERENCES "footers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "footer_column_translation" ADD CONSTRAINT "footer_column_translation_columnId_fkey" FOREIGN KEY ("columnId") REFERENCES "footer_columns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "footer_link_translation" ADD CONSTRAINT "footer_link_translation_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "footer_links"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "header_nav_item_translation" ADD CONSTRAINT "header_nav_item_translation_navItemId_fkey" FOREIGN KEY ("navItemId") REFERENCES "header_nav_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_translation" ADD CONSTRAINT "project_translation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technology_translation" ADD CONSTRAINT "technology_translation_technologyId_fkey" FOREIGN KEY ("technologyId") REFERENCES "technologies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_member_translation" ADD CONSTRAINT "team_member_translation_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "team_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_translation" ADD CONSTRAINT "client_translation_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "testimonial_translation" ADD CONSTRAINT "testimonial_translation_testimonialId_fkey" FOREIGN KEY ("testimonialId") REFERENCES "testimonials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_translation" ADD CONSTRAINT "blog_translation_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "blogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_translation" ADD CONSTRAINT "category_translation_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "slideshow_translation" ADD CONSTRAINT "slideshow_translation_slideShowId_fkey" FOREIGN KEY ("slideShowId") REFERENCES "slideshows"("id") ON DELETE CASCADE ON UPDATE CASCADE;
