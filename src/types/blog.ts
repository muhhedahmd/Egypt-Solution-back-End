
// FILE: src/types/blog.ts

export type BlogStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface CreateBlogDTO {
  title: string;
  excerpt?: string;
  content: string;
  image?: Buffer;
  authorId: string;
  status?: BlogStatus;
  publishedAt?: string | Date;
  isFeatured?: boolean;
  readingTime?: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  categoryIds?: string[];
}

export interface UpdateBlogDTO {
  id: string;
  title?: string;
  excerpt?: string;
  content?: string;
  image?: Buffer;
  imageState?: "KEEP" | "REMOVE" | "UPDATE";
  slug?: string;
  status?: BlogStatus;
  publishedAt?: string | Date;
  isFeatured?: boolean;
  readingTime?: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  categoryIds?: string[];
}

export interface BlogDTO {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  imageId?: string;
  authorId: string;
  status: BlogStatus;
  publishedAt?: Date;
  isFeatured: boolean;
  views: number;
  readingTime?: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCategoryDTO {
  name: string;
}

export interface UpdateCategoryDTO {
  id: string;
  name?: string;
  slug?: string;
}

export interface CategoryDTO {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BlogCategoryDTO {
  blogId: string;
  categoryId: string;
}

export interface BulkAssignCategoriesDTO {
  items: BlogCategoryDTO[];
}

export interface BulkRemoveCategoriesDTO {
  items: BlogCategoryDTO[];
}