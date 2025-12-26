"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blogRoutes = void 0;
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
class blogRoutes {
    constructor(controller) {
        this.controller = controller;
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        const asyncHandler = (fn) => (req, res, next) => {
            Promise.resolve(fn(req, res, next)).catch(next);
        };
        // Get all blogs
        this.router.get("/", asyncHandler(this.controller.getAllBlogs.bind(this.controller)));
        // Get single blog by ID
        this.router.get("/:id", asyncHandler(this.controller.getBlogById.bind(this.controller)));
        // Create new blog (with image upload)
        this.router.post("/", asyncHandler(auth_1.requireAuthv2), asyncHandler(this.controller.createBlog.bind(this.controller)));
        // Update blog (with optional image upload)
        this.router.put("/:id", asyncHandler(auth_1.requireAuthv2), asyncHandler(this.controller.updateBlog.bind(this.controller)));
        // Delete blog
        this.router.delete("/:id", asyncHandler(auth_1.requireAuthv2), asyncHandler(this.controller.deleteBlog.bind(this.controller)));
        // Get published blogs
        this.router.get("/published/all", asyncHandler(this.controller.getPublishedBlogs.bind(this.controller)));
        // Get featured blogs
        this.router.get("/featured/all", asyncHandler(this.controller.getFeaturedBlogs.bind(this.controller)));
        // Get blogs by status
        this.router.get("/status/:status", asyncHandler(this.controller.getBlogsByStatus.bind(this.controller)));
        // Search blogs
        this.router.get("/search/query", asyncHandler(this.controller.searchBlogs.bind(this.controller)));
        // Increment blog views
        this.router.post("/:id/views", asyncHandler(this.controller.incrementViews.bind(this.controller)));
        // ============================================
        // CATEGORY ROUTES
        // ============================================
        // Get all categories
        this.router.get("/categories/all", asyncHandler(this.controller.getAllCategories.bind(this.controller)));
        // Create new category
        this.router.post("/category", asyncHandler(auth_1.requireAuthv2), asyncHandler(this.controller.createCategory.bind(this.controller)));
        // Get category by ID
        this.router.get("/category/:id", asyncHandler(this.controller.getCategoryById.bind(this.controller)));
        // Update category
        this.router.put("/category/:id", asyncHandler(auth_1.requireAuthv2), asyncHandler(this.controller.updateCategory.bind(this.controller)));
        // Delete category
        this.router.delete("/category/:id", asyncHandler(auth_1.requireAuthv2), asyncHandler(this.controller.deleteCategory.bind(this.controller)));
        // ============================================
        // BLOG-CATEGORY RELATIONSHIP ROUTES
        // ============================================
        // Assign blogs to category (bulk)
        this.router.post("/assign-category", asyncHandler(auth_1.requireAuthv2), asyncHandler(this.controller.assignBlogToCategory.bind(this.controller)));
        // Remove blogs from category (bulk)
        this.router.delete("/remove-category", asyncHandler(auth_1.requireAuthv2), asyncHandler(this.controller.removeBlogFromCategory.bind(this.controller)));
        // Get all blogs by category ID
        this.router.get("/by-category/:id", asyncHandler(this.controller.getBlogsByCategory.bind(this.controller)));
        // Get all categories by blog ID
        this.router.get("/blog-categories/:id", asyncHandler(this.controller.getCategoriesByBlog.bind(this.controller)));
    }
    getRoutes() {
        return this.router;
    }
}
exports.blogRoutes = blogRoutes;
