"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.blogRepository = void 0;
const crypto_1 = require("crypto");
const slugify_1 = __importDefault(require("slugify"));
const helpers_1 = require("../../lib/helpers");
const services_error_1 = require("../../errors/services.error");
const client_1 = require("@prisma/client");
class blogRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findMany(skip, take) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.blog.findMany({
                include: {
                    image: true,
                    author: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    categories: {
                        include: {
                            category: true,
                        },
                    },
                },
                skip: skip * take,
                take,
                orderBy: {
                    createdAt: "desc",
                },
            });
        });
    }
    count() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.blog.count();
        });
    }
    findById(id, prismaTouse) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const blog = yield (prismaTouse || this.prisma).blog.findUnique({
                    where: { id },
                    include: {
                        image: true,
                        author: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                        categories: {
                            include: {
                                category: true,
                            },
                        },
                    },
                });
                return blog;
            }
            catch (error) {
                if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                    if (error.code === "P2025") {
                        throw new services_error_1.ServiceError("Blog not found", 404, "BLOG_NOT_FOUND");
                    }
                }
                console.error(error);
                throw new services_error_1.ServiceError("Error finding blog by ID", 400, "BLOG_GET_ERROR");
            }
        });
    }
    create(data, prismaTouse) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const transaction = yield this.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                    const slug = (0, slugify_1.default)(data.title + (0, crypto_1.randomUUID)().substring(0, 8), {
                        lower: true,
                    });
                    if (!slug)
                        throw new Error("Error creating slug");
                    let imageId = null;
                    if (data.image) {
                        const createImage = yield (0, helpers_1.UploadImage)(data.image, data.title);
                        if (!createImage)
                            throw new Error("Error uploading image");
                        const imageToDB = yield (0, helpers_1.AssignImageToDBImage)({
                            imageType: "BLOG",
                            blurhash: createImage.blurhash,
                            width: createImage.width,
                            height: createImage.height,
                            data: createImage.data,
                        }, tx);
                        if (!imageToDB)
                            throw new Error("Error creating image in DB");
                        imageId = imageToDB.id;
                    }
                    const { image: _image, categoryIds } = data, createRest = __rest(data, ["image", "categoryIds"]);
                    const blog = yield tx.blog.create({
                        data: Object.assign(Object.assign({}, createRest), { imageId,
                            slug }),
                        include: {
                            image: true,
                        },
                    });
                    // Assign categories if provided
                    if (categoryIds && categoryIds.length > 0) {
                        yield Promise.all(categoryIds.map((categoryId) => tx.blogCategory.create({
                            data: {
                                blogId: blog.id,
                                categoryId,
                            },
                        })));
                    }
                    const { image } = blog, rest = __rest(blog, ["image"]);
                    return { Image: image, blog: rest };
                }), {
                    timeout: 20000,
                    maxWait: 5000,
                });
                return transaction;
            }
            catch (error) {
                console.error(error);
                throw new services_error_1.ServiceError("Error creating blog", 400, "BLOG_CREATE_ERROR");
            }
        });
    }
    update(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const transaction = yield this.prisma.$transaction((prismaTx) => __awaiter(this, void 0, void 0, function* () {
                    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
                    let NewImageId = null;
                    if (!data.id)
                        throw new Error("No blog ID provided");
                    const blog = yield this.findById(data.id, prismaTx);
                    if (!blog)
                        throw new Error("Blog not found");
                    NewImageId = (blog === null || blog === void 0 ? void 0 : blog.imageId) || null;
                    // Handle image state
                    if (data.imageState === "REMOVE") {
                        if (blog.imageId) {
                            yield prismaTx.blog.update({
                                where: { id: data.id },
                                data: { imageId: null },
                            });
                            yield (0, helpers_1.deleteImageById)(blog.imageId, prismaTx);
                        }
                        NewImageId = null;
                    }
                    if (data.imageState === "UPDATE") {
                        if (blog.imageId) {
                            yield prismaTx.blog.update({
                                where: { id: data.id },
                                data: { imageId: null },
                            });
                            yield (0, helpers_1.deleteImageById)(blog.imageId, prismaTx);
                        }
                        if (!data.image)
                            throw new Error("No image provided");
                        const createImage = yield (0, helpers_1.UploadImage)(data.image, data.title || "update");
                        if (!createImage)
                            throw new Error("Error uploading image");
                        const imageToDB = yield (0, helpers_1.AssignImageToDBImage)({
                            imageType: "BLOG",
                            blurhash: createImage.blurhash,
                            width: createImage.width,
                            height: createImage.height,
                            data: createImage.data,
                        }, prismaTx);
                        if (!imageToDB)
                            throw new Error("Error creating image in DB");
                        NewImageId = imageToDB.id;
                    }
                    // Generate new slug if title changed
                    if (data.title && data.title !== blog.title) {
                        const slug = (0, slugify_1.default)(data.title + (0, crypto_1.randomUUID)().substring(0, 8), {
                            lower: true,
                        });
                        data.slug = slug;
                    }
                    // Handle categories
                    if (data.categoryIds) {
                        // Remove existing categories
                        yield prismaTx.blogCategory.deleteMany({
                            where: { blogId: data.id },
                        });
                        // Add new categories
                        if (data.categoryIds.length > 0) {
                            yield Promise.all(data.categoryIds.map((categoryId) => prismaTx.blogCategory.create({
                                data: {
                                    blogId: data.id,
                                    categoryId,
                                },
                            })));
                        }
                    }
                    const updatedBlog = yield prismaTx.blog.update({
                        where: { id: data.id },
                        data: {
                            slug: (_a = data.slug) !== null && _a !== void 0 ? _a : blog.slug,
                            title: (_b = data.title) !== null && _b !== void 0 ? _b : blog.title,
                            excerpt: (_c = data.excerpt) !== null && _c !== void 0 ? _c : blog.excerpt,
                            content: (_d = data.content) !== null && _d !== void 0 ? _d : blog.content,
                            imageId: NewImageId,
                            status: (_e = data.status) !== null && _e !== void 0 ? _e : blog.status,
                            publishedAt: (_f = data.publishedAt) !== null && _f !== void 0 ? _f : blog.publishedAt,
                            isFeatured: (_g = data.isFeatured) !== null && _g !== void 0 ? _g : blog.isFeatured,
                            readingTime: (_h = data.readingTime) !== null && _h !== void 0 ? _h : blog.readingTime,
                            metaTitle: (_j = data.metaTitle) !== null && _j !== void 0 ? _j : blog.metaTitle,
                            metaDescription: (_k = data.metaDescription) !== null && _k !== void 0 ? _k : blog.metaDescription,
                            metaKeywords: (_l = data.metaKeywords) !== null && _l !== void 0 ? _l : blog.metaKeywords,
                        },
                        include: { image: true },
                    });
                    const { image } = updatedBlog, rest = __rest(updatedBlog, ["image"]);
                    return { Image: image, blog: rest };
                }), {
                    timeout: 20000,
                    maxWait: 5000,
                });
                return transaction;
            }
            catch (error) {
                console.error(error);
                throw new services_error_1.ServiceError("Error updating blog", 400, "BLOG_UPDATE_ERROR");
            }
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const transaction = yield this.prisma.$transaction((prismaTx) => __awaiter(this, void 0, void 0, function* () {
                    const blog = yield prismaTx.blog.findUnique({ where: { id } });
                    if (!blog)
                        throw new Error("Blog not found");
                    // Remove categories
                    yield prismaTx.blogCategory.deleteMany({
                        where: { blogId: id },
                    });
                    // Remove image
                    yield prismaTx.blog.update({
                        where: { id },
                        data: { imageId: null },
                    });
                    if (blog.imageId)
                        yield (0, helpers_1.deleteImageById)(blog.imageId, prismaTx);
                    const blogDeleted = yield prismaTx.blog.delete({
                        where: { id },
                    });
                    return blog;
                }), {
                    timeout: 20000,
                    maxWait: 5000,
                });
                return transaction;
            }
            catch (error) {
                console.error(error);
                throw new services_error_1.ServiceError("Error deleting blog", 400, "BLOG_DELETE_ERROR");
            }
        });
    }
    findPublished(skip, take) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.blog.findMany({
                where: {
                    status: "PUBLISHED",
                    publishedAt: {
                        lte: new Date(),
                    },
                },
                include: {
                    image: true,
                    author: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    categories: {
                        include: {
                            category: true,
                        },
                    },
                },
                skip: skip * take,
                take,
                orderBy: {
                    publishedAt: "desc",
                },
            });
        });
    }
    countPublished() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.blog.count({
                where: {
                    status: "PUBLISHED",
                    publishedAt: {
                        lte: new Date(),
                    },
                },
            });
        });
    }
    findFeatured(skip, take) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.blog.findMany({
                where: {
                    isFeatured: true,
                    status: "PUBLISHED",
                },
                include: {
                    image: true,
                    author: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    categories: {
                        include: {
                            category: true,
                        },
                    },
                },
                skip: skip * take,
                take,
                orderBy: {
                    publishedAt: "desc",
                },
            });
        });
    }
    countFeatured() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.blog.count({
                where: {
                    isFeatured: true,
                    status: "PUBLISHED",
                },
            });
        });
    }
    findByStatus(status, skip, take) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.blog.findMany({
                where: { status },
                include: {
                    image: true,
                    author: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    categories: {
                        include: {
                            category: true,
                        },
                    },
                },
                skip: skip * take,
                take,
                orderBy: {
                    createdAt: "desc",
                },
            });
        });
    }
    countByStatus(status) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.blog.count({
                where: { status },
            });
        });
    }
    searchBlogs(searchTerm, skip, take) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.blog.findMany({
                where: {
                    OR: [
                        {
                            title: {
                                contains: searchTerm,
                                mode: "insensitive",
                            },
                        },
                        {
                            excerpt: {
                                contains: searchTerm,
                                mode: "insensitive",
                            },
                        },
                        {
                            content: {
                                contains: searchTerm,
                                mode: "insensitive",
                            },
                        },
                    ],
                },
                include: {
                    image: true,
                    author: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    categories: {
                        include: {
                            category: true,
                        },
                    },
                },
                skip: skip * take,
                take,
                orderBy: {
                    createdAt: "desc",
                },
            });
        });
    }
    countSearchResults(searchTerm) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.blog.count({
                where: {
                    OR: [
                        {
                            title: {
                                contains: searchTerm,
                                mode: "insensitive",
                            },
                        },
                        {
                            excerpt: {
                                contains: searchTerm,
                                mode: "insensitive",
                            },
                        },
                        {
                            content: {
                                contains: searchTerm,
                                mode: "insensitive",
                            },
                        },
                    ],
                },
            });
        });
    }
    //   return this.prisma.blog.update({
    //     where: { id },
    //     data: {
    //       views: { increment: 1 },
    //     },
    //   });
    // }
    findCategoryById(id, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const category = yield (tx || this.prisma).category.findUnique({
                    where: { id },
                });
                return category;
            }
            catch (error) {
                if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                    if (error.code === "P2025") {
                        throw new services_error_1.ServiceError("Category not found", 404, "CATEGORY_NOT_FOUND");
                    }
                }
                console.error(error);
                throw new services_error_1.ServiceError("Error finding category by ID", 400, "CATEGORY_GET_ERROR");
            }
        });
    }
    createCategory(data, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const slug = (0, slugify_1.default)(data.name + (0, crypto_1.randomUUID)().substring(0, 8), {
                    lower: true,
                });
                const category = yield (tx || this.prisma).category.create({
                    data: {
                        name: data.name,
                        slug,
                    },
                });
                return category;
            }
            catch (error) {
                console.error(error);
                throw new services_error_1.ServiceError("Error creating category", 400, "CATEGORY_CREATE_ERROR");
            }
        });
    }
    findManyCategories(skip, take) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.category.findMany({
                skip: skip * take,
                take,
                orderBy: {
                    name: "asc",
                },
                include: {
                    _count: {
                        select: {
                            blogs: true,
                        },
                    },
                },
            });
        });
    }
    countCategories() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.category.count();
        });
    }
    updateCategory(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const category = yield this.prisma.category.update({
                    where: { id },
                    data: {
                        name: data.name,
                    },
                });
                return category;
            }
            catch (error) {
                if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                    if (error.code === "P2025") {
                        throw new services_error_1.ServiceError("Category not found", 404, "CATEGORY_NOT_FOUND");
                    }
                }
                console.error(error);
                throw new services_error_1.ServiceError("Error updating category", 400, "CATEGORY_UPDATE_ERROR");
            }
        });
    }
    deleteCategory(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Remove blog-category relationships
                yield this.prisma.blogCategory.deleteMany({
                    where: { categoryId: id },
                });
                const category = yield this.prisma.category.delete({
                    where: { id },
                });
                return category;
            }
            catch (error) {
                if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                    if (error.code === "P2025") {
                        throw new services_error_1.ServiceError("Category not found", 404, "CATEGORY_NOT_FOUND");
                    }
                }
                console.error(error);
                throw new services_error_1.ServiceError("Error deleting category", 400, "CATEGORY_DELETE_ERROR");
            }
        });
    }
    assignBlogToCategory(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const transaction = yield this.prisma.$transaction((prismaTx) => __awaiter(this, void 0, void 0, function* () {
                    const promises = yield Promise.all(data.map((item) => __awaiter(this, void 0, void 0, function* () {
                        yield this.findById(item.blogId, prismaTx);
                        yield this.findCategoryById(item.categoryId, prismaTx);
                        const blogCategory = yield prismaTx.blogCategory.create({
                            data: {
                                blogId: item.blogId,
                                categoryId: item.categoryId,
                            },
                            include: { blog: true, category: true },
                        });
                        return blogCategory;
                    })));
                    return promises;
                }), {
                    timeout: 20000,
                    maxWait: 5000,
                });
                return transaction;
            }
            catch (error) {
                console.error(error);
                throw new services_error_1.ServiceError("Error assigning blog to category", 400, "ASSIGN_BLOG_TO_CATEGORY_ERROR");
            }
        });
    }
    removeBlogFromCategory(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const transaction = yield this.prisma.$transaction((prismaTx) => __awaiter(this, void 0, void 0, function* () {
                    const promises = yield Promise.all(data.map((item) => __awaiter(this, void 0, void 0, function* () {
                        yield this.findById(item.blogId, prismaTx);
                        yield this.findCategoryById(item.categoryId, prismaTx);
                        const blogCategory = yield prismaTx.blogCategory.delete({
                            where: {
                                blogId_categoryId: {
                                    blogId: item.blogId,
                                    categoryId: item.categoryId,
                                },
                            },
                        });
                        return blogCategory;
                    })));
                    return promises;
                }), {
                    timeout: 20000,
                    maxWait: 5000,
                });
                return transaction;
            }
            catch (error) {
                console.error(error);
                throw new services_error_1.ServiceError("Error removing blog from category", 400, "REMOVE_BLOG_FROM_CATEGORY_ERROR");
            }
        });
    }
    findBlogsByCategory(categoryId, skip, take) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.blog.findMany({
                where: {
                    categories: {
                        some: {
                            categoryId,
                        },
                    },
                },
                include: {
                    image: true,
                    author: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    categories: {
                        include: {
                            category: true,
                        },
                    },
                },
                skip: skip * take,
                take,
                orderBy: {
                    createdAt: "desc",
                },
            });
        });
    }
    countBlogsByCategory(categoryId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.blog.count({
                where: {
                    categories: {
                        some: {
                            categoryId,
                        },
                    },
                },
            });
        });
    }
    findCategoriesByBlog(blogId, skip, take) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.category.findMany({
                where: {
                    blogs: {
                        some: {
                            blogId,
                        },
                    },
                },
                skip: skip * take,
                take,
                orderBy: {
                    name: "asc",
                },
            });
        });
    }
    countCategoriesByBlog(blogId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.category.count({
                where: {
                    blogs: {
                        some: {
                            blogId,
                        },
                    },
                },
            });
        });
    }
}
exports.blogRepository = blogRepository;
// ============================================
// SUMMARY: 28 METHODS TOTAL
// ============================================
/*
BLOG CRUD (5):
- findMany()
- count()
- findById()
- create()
- update()
- delete()

BLOG FILTERS (9):
- findPublished()
- countPublished()
- findFeatured()
- countFeatured()
- findByStatus()
- countByStatus()
- searchBlogs()
- countSearchResults()
- incrementViews()

CATEGORY CRUD (6):
- findCategoryById()
- createCategory()
- findManyCategories()
- countCategories()
- updateCategory()
- deleteCategory()

RELATIONSHIPS (8):
- assignBlogToCategory()
- removeBlogFromCategory()
- findBlogsByCategory()
- countBlogsByCategory()
- findCategoriesByBlog()
- countCategoriesByBlog()
*/ 
