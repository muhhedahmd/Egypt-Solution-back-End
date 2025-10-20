
import { z } from "zod";
import {
  CreateBlogDTO,
  UpdateBlogDTO,
  CreateCategoryDTO,
  UpdateCategoryDTO,
  BlogCategoryDTO,
  BulkAssignCategoriesDTO,
  BulkRemoveCategoriesDTO,
} from "../types/blog";
import { ServiceValidationError } from "./services.error";
// import { ServiceValidationError, CategoryValidationError } from "../errors/blog.error";

export class BlogValidator {

  private createBlogSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters").max(200, "Title must be less than 200 characters"),
    excerpt: z.string().max(500, "Excerpt must be less than 500 characters").optional(),
    content: z.string().min(10, "Content must be at least 10 characters"),
    image: z.instanceof(Buffer).optional(),
    authorId: z.string().min(1, "Author ID is required"),
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
    publishedAt: z.string().datetime().optional().or(z.date().optional()),
    isFeatured: z.boolean().default(false),
    readingTime: z.number().int().min(0, "Reading time must be positive").optional(),
    metaTitle: z.string().max(200, "Meta title must be less than 200 characters").optional(),
    metaDescription: z.string().max(500, "Meta description must be less than 500 characters").optional(),
    metaKeywords: z.string().optional(),
    categoryIds: z.array(z.string()).optional(),
  });

  private updateBlogSchema = z.object({
    id: z.string().min(1, "Blog ID is required"),
    title: z.string().min(3, "Title must be at least 3 characters").max(200, "Title must be less than 200 characters").optional(),
    excerpt: z.string().max(500, "Excerpt must be less than 500 characters").optional(),
    content: z.string().min(10, "Content must be at least 10 characters").optional(),
    image: z.instanceof(Buffer).optional(),
    imageState: z.enum(["KEEP", "REMOVE", "UPDATE"]).optional(),
    slug: z.string().optional(),
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
    publishedAt: z.string().datetime().optional().or(z.date().optional()),
    isFeatured: z.boolean().optional(),
    readingTime: z.number().int().min(0, "Reading time must be positive").optional(),
    metaTitle: z.string().max(200, "Meta title must be less than 200 characters").optional(),
    metaDescription: z.string().max(500, "Meta description must be less than 500 characters").optional(),
    metaKeywords: z.string().optional(),
    categoryIds: z.array(z.string()).optional(),
  });


  private createCategorySchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
  });

  private updateCategorySchema = z.object({
    id: z.string().min(1, "Category ID is required"),
    name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters").optional(),
    slug: z.string().optional(),
  });


  private paginationSchema = z.object({
    skip: z.number().int().min(0, "Skip must be 0 or greater").default(0),
    take: z.number().int().min(1, "Take must be at least 1").max(100, "Take must be 100 or less").default(10),
  });


  private bulkAssignSchema = z.object({
    items: z.array(
      z.object({
        blogId: z.string().min(1, "Blog ID is required"),
        categoryId: z.string().min(1, "Category ID is required"),
      })
    ).min(1, "At least one item is required"),
  });

  private bulkRemoveSchema = z.object({
    items: z.array(
      z.object({
        blogId: z.string().min(1, "Blog ID is required"),
        categoryId: z.string().min(1, "Category ID is required"),
      })
    ).min(1, "At least one item is required"),
  });

  // BLOG VALIDATION METHODS

  validateCreate(data: unknown): CreateBlogDTO {
    try {
      return this.createBlogSchema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.errors.map(e => e.message).join(", ");
        throw new ServiceValidationError(`Invalid blog data: ${messages}`);
      }
      throw new ServiceValidationError("Invalid blog data");
    }
  }

  validateUpdate(data: unknown): UpdateBlogDTO {
    try {
      return this.updateBlogSchema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.errors.map(e => e.message).join(", ");
        throw new ServiceValidationError(`Invalid update data: ${messages}`);
      }
      throw new ServiceValidationError("Invalid update data");
    }
  }

  // ============================================================================
  // CATEGORY VALIDATION METHODS
  // ============================================================================

  validateCreateCategory(data: unknown): CreateCategoryDTO {
    try {
      return this.createCategorySchema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.errors.map(e => e.message).join(", ");
        throw new ServiceValidationError(`Invalid category data: ${messages}`);
      }
      throw new ServiceValidationError("Invalid category data");
    }
  }

  validateUpdateCategory(data: unknown): UpdateCategoryDTO {
    try {
      return this.updateCategorySchema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.errors.map(e => e.message).join(", ");
        throw new ServiceValidationError(`Invalid category update data: ${messages}` , undefined, "CategoryValidationError");
      }
      throw new ServiceValidationError("Invalid category update data"  , undefined, "CategoryValidationError");
    }
  }


  validatePagination(data: unknown) {
    try {
      return this.paginationSchema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.errors.map(e => e.message).join(", ");
        throw new ServiceValidationError(`Invalid pagination parameters: ${messages}`);
      }
      throw new ServiceValidationError("Invalid pagination parameters");
    }
  }

  validateBulkAssign(data: unknown): BulkAssignCategoriesDTO {
    try {
      return this.bulkAssignSchema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.errors.map(e => e.message).join(", ");
        throw new ServiceValidationError(`Invalid bulk assign data: ${messages}`);
      }
      throw new ServiceValidationError("Invalid bulk assign data");
    }
  }

  validateBulkRemove(data: unknown): BulkRemoveCategoriesDTO {
    try {
      return this.bulkRemoveSchema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.errors.map(e => e.message).join(", ");
        throw new ServiceValidationError(`Invalid bulk remove data: ${messages}`);
      }
      throw new ServiceValidationError("Invalid bulk remove data");
    }
  }

  validateId(id: string): string {
    if (!id || typeof id !== "string" || id.trim().length === 0) {
      throw new ServiceValidationError("Invalid ID: ID must be a non-empty string");
    }
    return id;
  }

  validateStatus(status: string): "DRAFT" | "PUBLISHED" | "ARCHIVED" {
    if (!["DRAFT", "PUBLISHED", "ARCHIVED"].includes(status)) {
      throw new ServiceValidationError("Invalid status. Must be DRAFT, PUBLISHED, or ARCHIVED");
    }
    return status as "DRAFT" | "PUBLISHED" | "ARCHIVED";
  }
}