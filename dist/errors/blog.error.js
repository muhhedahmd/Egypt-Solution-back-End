"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlogValidator = void 0;
const zod_1 = require("zod");
const services_error_1 = require("./services.error");
// import { ServiceValidationError, CategoryValidationError } from "../errors/blog.error";
class BlogValidator {
    constructor() {
        this.createBlogSchema = zod_1.z.object({
            title: zod_1.z.string().min(3, "Title must be at least 3 characters").max(200, "Title must be less than 200 characters"),
            excerpt: zod_1.z.string().max(500, "Excerpt must be less than 500 characters").optional(),
            content: zod_1.z.string().min(10, "Content must be at least 10 characters"),
            image: zod_1.z.instanceof(Buffer).optional(),
            authorId: zod_1.z.string().min(1, "Author ID is required"),
            status: zod_1.z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
            publishedAt: zod_1.z.string().datetime().optional().or(zod_1.z.date().optional()),
            isFeatured: zod_1.z.boolean().default(false),
            readingTime: zod_1.z.number().int().min(0, "Reading time must be positive").optional(),
            metaTitle: zod_1.z.string().max(200, "Meta title must be less than 200 characters").optional(),
            metaDescription: zod_1.z.string().max(500, "Meta description must be less than 500 characters").optional(),
            metaKeywords: zod_1.z.string().optional(),
            categoryIds: zod_1.z.array(zod_1.z.string()).optional(),
        });
        this.updateBlogSchema = zod_1.z.object({
            id: zod_1.z.string().min(1, "Blog ID is required"),
            title: zod_1.z.string().min(3, "Title must be at least 3 characters").max(200, "Title must be less than 200 characters").optional(),
            excerpt: zod_1.z.string().max(500, "Excerpt must be less than 500 characters").optional(),
            content: zod_1.z.string().min(10, "Content must be at least 10 characters").optional(),
            image: zod_1.z.instanceof(Buffer).optional(),
            imageState: zod_1.z.enum(["KEEP", "REMOVE", "UPDATE"]).optional(),
            slug: zod_1.z.string().optional(),
            status: zod_1.z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
            publishedAt: zod_1.z.string().datetime().optional().or(zod_1.z.date().optional()),
            isFeatured: zod_1.z.boolean().optional(),
            readingTime: zod_1.z.number().int().min(0, "Reading time must be positive").optional(),
            metaTitle: zod_1.z.string().max(200, "Meta title must be less than 200 characters").optional(),
            metaDescription: zod_1.z.string().max(500, "Meta description must be less than 500 characters").optional(),
            metaKeywords: zod_1.z.string().optional(),
            categoryIds: zod_1.z.array(zod_1.z.string()).optional(),
        });
        this.createCategorySchema = zod_1.z.object({
            name: zod_1.z.string().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
        });
        this.updateCategorySchema = zod_1.z.object({
            id: zod_1.z.string().min(1, "Category ID is required"),
            name: zod_1.z.string().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters").optional(),
            slug: zod_1.z.string().optional(),
        });
        this.paginationSchema = zod_1.z.object({
            skip: zod_1.z.number().int().min(0, "Skip must be 0 or greater").default(0),
            take: zod_1.z.number().int().min(1, "Take must be at least 1").max(100, "Take must be 100 or less").default(10),
        });
        this.bulkAssignSchema = zod_1.z.object({
            items: zod_1.z.array(zod_1.z.object({
                blogId: zod_1.z.string().min(1, "Blog ID is required"),
                categoryId: zod_1.z.string().min(1, "Category ID is required"),
            })).min(1, "At least one item is required"),
        });
        this.bulkRemoveSchema = zod_1.z.object({
            items: zod_1.z.array(zod_1.z.object({
                blogId: zod_1.z.string().min(1, "Blog ID is required"),
                categoryId: zod_1.z.string().min(1, "Category ID is required"),
            })).min(1, "At least one item is required"),
        });
    }
    // BLOG VALIDATION METHODS
    validateCreate(data) {
        try {
            return this.createBlogSchema.parse(data);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const messages = error.errors.map(e => e.message).join(", ");
                throw new services_error_1.ServiceValidationError(`Invalid blog data: ${messages}`);
            }
            throw new services_error_1.ServiceValidationError("Invalid blog data");
        }
    }
    validateUpdate(data) {
        try {
            return this.updateBlogSchema.parse(data);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const messages = error.errors.map(e => e.message).join(", ");
                throw new services_error_1.ServiceValidationError(`Invalid update data: ${messages}`);
            }
            throw new services_error_1.ServiceValidationError("Invalid update data");
        }
    }
    // ============================================================================
    // CATEGORY VALIDATION METHODS
    // ============================================================================
    validateCreateCategory(data) {
        try {
            return this.createCategorySchema.parse(data);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const messages = error.errors.map(e => e.message).join(", ");
                throw new services_error_1.ServiceValidationError(`Invalid category data: ${messages}`);
            }
            throw new services_error_1.ServiceValidationError("Invalid category data");
        }
    }
    validateUpdateCategory(data) {
        try {
            return this.updateCategorySchema.parse(data);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const messages = error.errors.map(e => e.message).join(", ");
                throw new services_error_1.ServiceValidationError(`Invalid category update data: ${messages}`, undefined, "CategoryValidationError");
            }
            throw new services_error_1.ServiceValidationError("Invalid category update data", undefined, "CategoryValidationError");
        }
    }
    validatePagination(data) {
        try {
            return this.paginationSchema.parse(data);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const messages = error.errors.map(e => e.message).join(", ");
                throw new services_error_1.ServiceValidationError(`Invalid pagination parameters: ${messages}`);
            }
            throw new services_error_1.ServiceValidationError("Invalid pagination parameters");
        }
    }
    validateBulkAssign(data) {
        try {
            return this.bulkAssignSchema.parse(data);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const messages = error.errors.map(e => e.message).join(", ");
                throw new services_error_1.ServiceValidationError(`Invalid bulk assign data: ${messages}`);
            }
            throw new services_error_1.ServiceValidationError("Invalid bulk assign data");
        }
    }
    validateBulkRemove(data) {
        try {
            return this.bulkRemoveSchema.parse(data);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const messages = error.errors.map(e => e.message).join(", ");
                throw new services_error_1.ServiceValidationError(`Invalid bulk remove data: ${messages}`);
            }
            throw new services_error_1.ServiceValidationError("Invalid bulk remove data");
        }
    }
    validateId(id) {
        if (!id || typeof id !== "string" || id.trim().length === 0) {
            throw new services_error_1.ServiceValidationError("Invalid ID: ID must be a non-empty string");
        }
        return id;
    }
    validateStatus(status) {
        if (!["DRAFT", "PUBLISHED", "ARCHIVED"].includes(status)) {
            throw new services_error_1.ServiceValidationError("Invalid status. Must be DRAFT, PUBLISHED, or ARCHIVED");
        }
        return status;
    }
}
exports.BlogValidator = BlogValidator;
