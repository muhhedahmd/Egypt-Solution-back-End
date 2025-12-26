/*
  Warnings:

  - You are about to drop the column `pageViews` on the `analytics` table. All the data in the column will be lost.
  - You are about to drop the column `visitors` on the `analytics` table. All the data in the column will be lost.
  - You are about to drop the column `ipAddress` on the `page_views` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `analytics` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sessionId` to the `page_views` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "analytics_date_idx";

-- DropIndex
DROP INDEX "page_views_createdAt_idx";

-- AlterTable
ALTER TABLE "analytics" DROP COLUMN "pageViews",
DROP COLUMN "visitors",
ADD COLUMN     "avgSessionTime" INTEGER,
ADD COLUMN     "bounceRate" DOUBLE PRECISION,
ADD COLUMN     "desktopVisitors" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "directVisitors" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "formSubmissions" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "mobileVisitors" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "referralVisitors" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "searchVisitors" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "socialVisitors" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "tabletVisitors" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalBlogViews" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalPageViews" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "uniqueVisitors" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "page_views" DROP COLUMN "ipAddress",
ADD COLUMN     "browser" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "device" TEXT,
ADD COLUMN     "ipHash" TEXT,
ADD COLUMN     "isBounce" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isNewSession" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "os" TEXT,
ADD COLUMN     "pageTitle" TEXT,
ADD COLUMN     "pageType" TEXT,
ADD COLUMN     "scrollDepth" INTEGER,
ADD COLUMN     "sessionId" TEXT NOT NULL,
ADD COLUMN     "timeOnPage" INTEGER,
ADD COLUMN     "utmCampaign" TEXT,
ADD COLUMN     "utmMedium" TEXT,
ADD COLUMN     "utmSource" TEXT;

-- CreateTable
CREATE TABLE "blog_viewers" (
    "id" TEXT NOT NULL,
    "blogId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "ipHash" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,
    "country" TEXT,
    "device" TEXT,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration" INTEGER,

    CONSTRAINT "blog_viewers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session-analytics" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "firstPagePath" TEXT NOT NULL,
    "lastPagePath" TEXT NOT NULL,
    "pageCount" INTEGER NOT NULL DEFAULT 1,
    "totalDuration" INTEGER NOT NULL DEFAULT 0,
    "referrer" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "device" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "ipHash" TEXT,
    "country" TEXT,
    "city" TEXT,
    "converted" BOOLEAN NOT NULL DEFAULT false,
    "isBounce" BOOLEAN NOT NULL DEFAULT false,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session-analytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "blog_viewers_blogId_idx" ON "blog_viewers"("blogId");

-- CreateIndex
CREATE INDEX "blog_viewers_sessionId_idx" ON "blog_viewers"("sessionId");

-- CreateIndex
CREATE INDEX "blog_viewers_viewedAt_idx" ON "blog_viewers"("viewedAt");

-- CreateIndex
CREATE UNIQUE INDEX "blog_viewers_blogId_sessionId_key" ON "blog_viewers"("blogId", "sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "session-analytics_sessionId_key" ON "session-analytics"("sessionId");

-- CreateIndex
CREATE INDEX "session-analytics_sessionId_idx" ON "session-analytics"("sessionId");

-- CreateIndex
CREATE INDEX "session-analytics_startedAt_idx" ON "session-analytics"("startedAt" DESC);

-- CreateIndex
CREATE INDEX "session-analytics_country_idx" ON "session-analytics"("country");

-- CreateIndex
CREATE INDEX "session-analytics_utmSource_idx" ON "session-analytics"("utmSource");

-- CreateIndex
CREATE INDEX "analytics_date_idx" ON "analytics"("date" DESC);

-- CreateIndex
CREATE INDEX "page_views_sessionId_idx" ON "page_views"("sessionId");

-- CreateIndex
CREATE INDEX "page_views_pageType_idx" ON "page_views"("pageType");

-- CreateIndex
CREATE INDEX "page_views_createdAt_idx" ON "page_views"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "page_views_referrer_idx" ON "page_views"("referrer");

-- CreateIndex
CREATE INDEX "page_views_utmSource_idx" ON "page_views"("utmSource");

-- AddForeignKey
ALTER TABLE "blog_viewers" ADD CONSTRAINT "blog_viewers_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "blogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
