-- CreateTable
CREATE TABLE "headers" (
    "id" TEXT NOT NULL,
    "logo" TEXT,
    "siteName" TEXT NOT NULL,
    "tagline" TEXT,
    "showSearch" BOOLEAN NOT NULL DEFAULT false,
    "showLanguageSelector" BOOLEAN NOT NULL DEFAULT false,
    "isSticky" BOOLEAN NOT NULL DEFAULT false,
    "backgroundColor" TEXT,
    "textColor" TEXT,
    "height" INTEGER DEFAULT 80,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "headers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "header_nav_items" (
    "id" TEXT NOT NULL,
    "headerId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isExternal" BOOLEAN NOT NULL DEFAULT false,
    "openInNewTab" BOOLEAN NOT NULL DEFAULT false,
    "parentId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "icon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "header_nav_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "footers" (
    "id" TEXT NOT NULL,
    "copyrightText" TEXT NOT NULL,
    "showSocialLinks" BOOLEAN NOT NULL DEFAULT true,
    "showNewsletter" BOOLEAN NOT NULL DEFAULT false,
    "backgroundColor" TEXT,
    "textColor" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "footers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "footer_columns" (
    "id" TEXT NOT NULL,
    "footerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "footer_columns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "footer_links" (
    "id" TEXT NOT NULL,
    "columnId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isExternal" BOOLEAN NOT NULL DEFAULT false,
    "openInNewTab" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "icon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "footer_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "header_nav_items_headerId_order_idx" ON "header_nav_items"("headerId", "order");

-- CreateIndex
CREATE INDEX "header_nav_items_parentId_idx" ON "header_nav_items"("parentId");

-- CreateIndex
CREATE INDEX "footer_columns_footerId_order_idx" ON "footer_columns"("footerId", "order");

-- CreateIndex
CREATE INDEX "footer_links_columnId_order_idx" ON "footer_links"("columnId", "order");

-- AddForeignKey
ALTER TABLE "header_nav_items" ADD CONSTRAINT "header_nav_items_headerId_fkey" FOREIGN KEY ("headerId") REFERENCES "headers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "header_nav_items" ADD CONSTRAINT "header_nav_items_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "header_nav_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "footer_columns" ADD CONSTRAINT "footer_columns_footerId_fkey" FOREIGN KEY ("footerId") REFERENCES "footers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "footer_links" ADD CONSTRAINT "footer_links_columnId_fkey" FOREIGN KEY ("columnId") REFERENCES "footer_columns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
