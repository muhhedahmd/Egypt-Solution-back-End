"use strict";
// FILE: src/controllers/blogController.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.blogController = void 0;
class blogController {
    constructor(logic) {
        this.logic = logic;
    }
    // ============================================
    // BLOG ENDPOINTS
    // ============================================
    createBlog(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const body = req.body;
                const file = req.files; // From multer
                // Get authorId from authenticated user
                const authorId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.id;
                const newBlog = yield this.logic.create(Object.assign(Object.assign({}, body), { image: Array.isArray(file) && file.length > 0 ? file[0].buffer : undefined, authorId, isFeatured: body.isFeatured === "true" ? true : false, status: body.status || "DRAFT", publishedAt: body.publishedAt ? new Date(body.publishedAt) : undefined, readingTime: body.readingTime ? Number(body.readingTime) : undefined, categoryIds: body.categoryIds
                        ? JSON.parse(body.categoryIds)
                        : undefined }));
                return res.status(201).json({
                    success: true,
                    message: "Blog created successfully",
                    data: newBlog,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getAllBlogs(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { skip, take } = req.query;
                const blogs = yield this.logic.getAllBlogs({
                    skip: Number(skip) || 0,
                    take: Number(take) || 10,
                });
                return res.status(200).json(Object.assign({ success: true, message: "Blogs fetched successfully" }, blogs));
            }
            catch (error) {
                next(error);
            }
        });
    }
    getBlogById(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const blog = yield this.logic.findById(id);
                if (!blog) {
                    return res.status(404).json({
                        success: false,
                        message: `Blog with ID ${id} not found`,
                    });
                }
                return res.status(200).json({
                    success: true,
                    message: "Blog fetched successfully",
                    data: blog,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    updateBlog(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const body = req.body;
                const id = req.params.id;
                const file = req.files; // From multer
                const updated = yield this.logic.update(Object.assign(Object.assign({}, body), { id, image: Array.isArray(file) && file.length > 0 ? file[0].buffer : undefined, imageState: body.imageState || "KEEP", isFeatured: body.isFeatured === "true" ? true : false, status: body.status || undefined, publishedAt: body.publishedAt ? new Date(body.publishedAt) : undefined, readingTime: body.readingTime ? Number(body.readingTime) : undefined, categoryIds: body.categoryIds
                        ? JSON.parse(body.categoryIds)
                        : undefined }));
                return res.status(200).json({
                    success: true,
                    message: "Blog updated successfully",
                    data: updated,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    deleteBlog(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const deleted = yield this.logic.delete(id);
                return res.status(200).json({
                    success: true,
                    message: "Blog deleted successfully",
                    data: deleted,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getPublishedBlogs(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { skip, take } = req.query;
                const blogs = yield this.logic.getPublishedBlogs({
                    skip: Number(skip) || 0,
                    take: Number(take) || 10,
                });
                return res.status(200).json(Object.assign({ success: true, message: "Published blogs fetched successfully" }, blogs));
            }
            catch (error) {
                next(error);
            }
        });
    }
    getFeaturedBlogs(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { skip, take } = req.query;
                const blogs = yield this.logic.getFeaturedBlogs({
                    skip: Number(skip) || 0,
                    take: Number(take) || 10,
                });
                return res.status(200).json(Object.assign({ success: true, message: "Featured blogs fetched successfully" }, blogs));
            }
            catch (error) {
                next(error);
            }
        });
    }
    getBlogsByStatus(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { skip, take } = req.query;
                const { status } = req.params;
                if (!["DRAFT", "PUBLISHED", "ARCHIVED"].includes(status)) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid status. Must be DRAFT, PUBLISHED, or ARCHIVED",
                    });
                }
                const blogs = yield this.logic.getBlogsByStatus(status, {
                    skip: Number(skip) || 0,
                    take: Number(take) || 10,
                });
                return res.status(200).json(Object.assign({ success: true, message: `Blogs with status ${status} fetched successfully` }, blogs));
            }
            catch (error) {
                next(error);
            }
        });
    }
    searchBlogs(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { skip, take, q } = req.query;
                if (!q || typeof q !== "string") {
                    return res.status(400).json({
                        success: false,
                        message: "Search query 'q' is required",
                    });
                }
                const blogs = yield this.logic.searchBlogs(q, {
                    skip: Number(skip) || 0,
                    take: Number(take) || 10,
                });
                return res.status(200).json(Object.assign({ success: true, message: "Blog search results" }, blogs));
            }
            catch (error) {
                next(error);
            }
        });
    }
    incrementViews(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const blog = yield this.logic.incrementViews(id);
                return res.status(200).json({
                    success: true,
                    message: "Blog views incremented",
                    data: blog,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    // ============================================
    // CATEGORY ENDPOINTS
    // ============================================
    createCategory(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const body = req.body;
                const newCategory = yield this.logic.createCategory({
                    name: body.name,
                });
                return res.status(201).json({
                    success: true,
                    message: "Category created successfully",
                    data: newCategory,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getAllCategories(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { skip, take } = req.query;
                const categories = yield this.logic.getAllCategories({
                    skip: Number(skip) || 0,
                    take: Number(take) || 10,
                });
                return res.status(200).json(Object.assign({ success: true, message: "Categories fetched successfully" }, categories));
            }
            catch (error) {
                next(error);
            }
        });
    }
    getCategoryById(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const category = yield this.logic.findCategoryById(id);
                if (!category) {
                    return res.status(404).json({
                        success: false,
                        message: `Category with ID ${id} not found`,
                    });
                }
                return res.status(200).json({
                    success: true,
                    message: "Category fetched successfully",
                    data: category,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    updateCategory(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const body = req.body;
                const updated = yield this.logic.updateCategory(id, {
                    name: body.name,
                });
                return res.status(200).json({
                    success: true,
                    message: "Category updated successfully",
                    data: updated,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    deleteCategory(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const deleted = yield this.logic.deleteCategory(id);
                return res.status(200).json({
                    success: true,
                    message: "Category deleted successfully",
                    data: deleted,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    // ============================================
    // BLOG-CATEGORY RELATIONSHIP ENDPOINTS
    // ============================================
    assignBlogToCategory(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const body = req.body;
                const assigned = yield this.logic.assignBlogToCategory(body);
                return res.status(200).json({
                    success: true,
                    message: "Blogs assigned to category successfully",
                    data: assigned,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    removeBlogFromCategory(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const body = req.body;
                const removed = yield this.logic.removeBlogFromCategory(body);
                return res.status(200).json({
                    success: true,
                    message: "Blogs removed from category successfully",
                    data: removed,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getBlogsByCategory(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { skip, take } = req.query;
                const blogs = yield this.logic.getBlogsByCategory(id, {
                    skip: Number(skip) || 0,
                    take: Number(take) || 10,
                });
                return res.status(200).json(Object.assign({ success: true, message: "Blogs by category fetched successfully" }, blogs));
            }
            catch (error) {
                next(error);
            }
        });
    }
    getCategoriesByBlog(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { skip, take } = req.query;
                const categories = yield this.logic.getCategoriesByBlog(id, {
                    skip: Number(skip) || 0,
                    take: Number(take) || 10,
                });
                return res.status(200).json(Object.assign({ success: true, message: "Categories by blog fetched successfully" }, categories));
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.blogController = blogController;
