"use strict";
// FILE: src/services/blog/blog.logic.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.blogLogic = void 0;
const crypto_1 = require("crypto");
const slugify_1 = __importDefault(require("slugify"));
const services_error_1 = require("../../errors/services.error");
class blogLogic {
    constructor(repository, validator) {
        this.repository = repository;
        this.validator = validator;
    }
    // BLOG METHODS
    getAllBlogs(params) {
        return __awaiter(this, void 0, void 0, function* () {
            this.validator.validatePagination(params);
            const skip = params.skip || 0;
            const take = params.take || 10;
            const [blogs, totalItems] = yield Promise.all([
                this.repository.findMany(skip, take),
                this.repository.count(),
            ]);
            const remainingItems = totalItems - (skip * take + blogs.length);
            return {
                data: blogs,
                pagination: {
                    totalItems,
                    remainingItems,
                    nowCount: blogs.length,
                    totalPages: Math.ceil(totalItems / take),
                    currentPage: skip + 1,
                    pageSize: take,
                },
            };
        });
    }
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataCreate = this.validator.validateCreate(data);
            const slug = (0, slugify_1.default)(dataCreate.title + (0, crypto_1.randomUUID)().substring(0, 6), {
                lower: true,
            });
            const blog = yield this.repository.create(Object.assign(Object.assign({}, dataCreate), { slug }));
            if (!blog)
                throw new services_error_1.ServiceError("Error creating blog", 400, "BLOG_CREATION_ERROR");
            return blog;
        });
    }
    update(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataUpdate = this.validator.validateUpdate(data);
            const updateBlog = yield this.repository.update(dataUpdate);
            return updateBlog;
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const validId = this.validator.validateId(id);
            const deleteBlog = yield this.repository.delete(validId);
            return deleteBlog;
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const validId = this.validator.validateId(id);
            const findBlog = yield this.repository.findById(validId);
            return findBlog;
        });
    }
    getPublishedBlogs(params) {
        return __awaiter(this, void 0, void 0, function* () {
            this.validator.validatePagination(params);
            const skip = params.skip || 0;
            const take = params.take || 10;
            const [blogs, totalItems] = yield Promise.all([
                this.repository.findPublished(skip, take),
                this.repository.countPublished(),
            ]);
            const remainingItems = totalItems - (skip * take + blogs.length);
            return {
                data: blogs,
                pagination: {
                    totalItems,
                    remainingItems,
                    nowCount: blogs.length,
                    totalPages: Math.ceil(totalItems / take),
                    currentPage: skip + 1,
                    pageSize: take,
                },
            };
        });
    }
    getFeaturedBlogs(params) {
        return __awaiter(this, void 0, void 0, function* () {
            this.validator.validatePagination(params);
            const skip = params.skip || 0;
            const take = params.take || 10;
            const [blogs, totalItems] = yield Promise.all([
                this.repository.findFeatured(skip, take),
                this.repository.countFeatured(),
            ]);
            const remainingItems = totalItems - (skip * take + blogs.length);
            return {
                data: blogs,
                pagination: {
                    totalItems,
                    remainingItems,
                    nowCount: blogs.length,
                    totalPages: Math.ceil(totalItems / take),
                    currentPage: skip + 1,
                    pageSize: take,
                },
            };
        });
    }
    getBlogsByStatus(status, params) {
        return __awaiter(this, void 0, void 0, function* () {
            this.validator.validatePagination(params);
            this.validator.validateStatus(status);
            const skip = params.skip || 0;
            const take = params.take || 10;
            const [blogs, totalItems] = yield Promise.all([
                this.repository.findByStatus(status, skip, take),
                this.repository.countByStatus(status),
            ]);
            const remainingItems = totalItems - (skip * take + blogs.length);
            return {
                data: blogs,
                pagination: {
                    totalItems,
                    remainingItems,
                    nowCount: blogs.length,
                    totalPages: Math.ceil(totalItems / take),
                    currentPage: skip + 1,
                    pageSize: take,
                },
            };
        });
    }
    searchBlogs(searchTerm, params) {
        return __awaiter(this, void 0, void 0, function* () {
            this.validator.validatePagination(params);
            if (!searchTerm || searchTerm.trim().length === 0) {
                throw new services_error_1.ServiceError("Search term is required", 400, "INVALID_SEARCH_TERM");
            }
            const skip = params.skip || 0;
            const take = params.take || 10;
            const [blogs, totalItems] = yield Promise.all([
                this.repository.searchBlogs(searchTerm, skip, take),
                this.repository.countSearchResults(searchTerm),
            ]);
            const remainingItems = totalItems - (skip * take + blogs.length);
            return {
                data: blogs,
                pagination: {
                    totalItems,
                    remainingItems,
                    nowCount: blogs.length,
                    totalPages: Math.ceil(totalItems / take),
                    currentPage: skip + 1,
                    pageSize: take,
                },
            };
        });
    }
    incrementViews(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const validId = this.validator.validateId(id);
            // const blog = await this.repository.incrementViews(validId);
            // return blog;
        });
    }
    // CATEGORY METHODS
    createCategory(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const validData = this.validator.validateCreateCategory(data);
            const category = yield this.repository.createCategory(validData);
            if (!category)
                throw new services_error_1.ServiceError("Error creating category", 400, "CATEGORY_CREATION_ERROR");
            return category;
        });
    }
    findCategoryById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const validId = this.validator.validateId(id);
            const category = yield this.repository.findCategoryById(validId);
            return category;
        });
    }
    getAllCategories(params) {
        return __awaiter(this, void 0, void 0, function* () {
            this.validator.validatePagination(params);
            const skip = params.skip || 0;
            const take = params.take || 10;
            const [categories, totalItems] = yield Promise.all([
                this.repository.findManyCategories(skip, take),
                this.repository.countCategories(),
            ]);
            const remainingItems = totalItems - (skip * take + categories.length);
            return {
                data: categories,
                pagination: {
                    totalItems,
                    remainingItems,
                    nowCount: categories.length,
                    totalPages: Math.ceil(totalItems / take),
                    currentPage: skip + 1,
                    pageSize: take,
                },
            };
        });
    }
    updateCategory(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            this.validator.validateId(id);
            const validData = this.validator.validateUpdateCategory({
                data,
                id,
            });
            const category = yield this.repository.updateCategory(id, validData);
            return category;
        });
    }
    deleteCategory(id) {
        return __awaiter(this, void 0, void 0, function* () {
            this.validator.validateId(id);
            const category = yield this.repository.deleteCategory(id);
            return category;
        });
    }
    // BLOG-CATEGORY RELATIONSHIP METHODS
    assignBlogToCategory(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const validData = this.validator.validateBulkAssign(data);
            const assigned = yield this.repository.assignBlogToCategory(validData.items);
            return assigned;
        });
    }
    removeBlogFromCategory(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const validData = this.validator.validateBulkRemove(data);
            const removed = yield this.repository.removeBlogFromCategory(validData.items);
            return removed;
        });
    }
    getBlogsByCategory(categoryId, params) {
        return __awaiter(this, void 0, void 0, function* () {
            this.validator.validatePagination(params);
            this.validator.validateId(categoryId);
            const skip = params.skip || 0;
            const take = params.take || 10;
            const [blogs, totalItems] = yield Promise.all([
                this.repository.findBlogsByCategory(categoryId, skip, take),
                this.repository.countBlogsByCategory(categoryId),
            ]);
            const remainingItems = totalItems - (skip * take + blogs.length);
            return {
                data: blogs,
                pagination: {
                    totalItems,
                    remainingItems,
                    nowCount: blogs.length,
                    totalPages: Math.ceil(totalItems / take),
                    currentPage: skip + 1,
                    pageSize: take,
                },
            };
        });
    }
    getCategoriesByBlog(blogId, params) {
        return __awaiter(this, void 0, void 0, function* () {
            this.validator.validatePagination(params);
            this.validator.validateId(blogId);
            const skip = params.skip || 0;
            const take = params.take || 10;
            const [categories, totalItems] = yield Promise.all([
                this.repository.findCategoriesByBlog(blogId, skip, take),
                this.repository.countCategoriesByBlog(blogId),
            ]);
            const remainingItems = totalItems - (skip * take + categories.length);
            return {
                data: categories,
                pagination: {
                    totalItems,
                    remainingItems,
                    nowCount: categories.length,
                    totalPages: Math.ceil(totalItems / take),
                    currentPage: skip + 1,
                    pageSize: take,
                },
            };
        });
    }
}
exports.blogLogic = blogLogic;
