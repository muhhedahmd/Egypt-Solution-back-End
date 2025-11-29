
// FILE: src/services/blog/blog.logic.ts

import { randomUUID } from "crypto";
import slugify from "slugify";
import { ServiceError } from "../../errors/services.error";
import { PaginatedResponse, PaginationParams } from "../../types/services";
import { Blog, Category, BlogCategory } from "@prisma/client";
import {
  CreateBlogDTO,
  UpdateBlogDTO,
  CreateCategoryDTO,
  BlogCategoryDTO,
} from "../../types/blog";
import { blogRepository } from "./blog.repostery";
import { BlogValidator } from "../../errors/blog.error";

export class blogLogic {
  constructor(
    private repository: blogRepository,
    private validator: BlogValidator
  ) {}

  // BLOG METHODS

  async getAllBlogs(
    params: PaginationParams
  ): Promise<PaginatedResponse<Blog>> {
    this.validator.validatePagination(params);
    const skip = params.skip || 0;
    const take = params.take || 10;

    const [blogs, totalItems] = await Promise.all([
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
  }

  async create(data: unknown): Promise<{ blog: Blog; Image: any }> {
    const dataCreate = this.validator.validateCreate(data);
    const slug = slugify(dataCreate.title + randomUUID().substring(0, 6), {
      lower: true,
    });

    const blog = await this.repository.create({ ...dataCreate, slug });
    if (!blog)
      throw new ServiceError("Error creating blog", 400, "BLOG_CREATION_ERROR");

    return blog;
  }

  async update(data: unknown): Promise<{ blog: Blog; Image: any }> {
    const dataUpdate = this.validator.validateUpdate(data);
    const updateBlog = await this.repository.update(dataUpdate);
    return updateBlog;
  }

  async delete(id: string): Promise<Blog> {
    const validId = this.validator.validateId(id);
    const deleteBlog = await this.repository.delete(validId);
    return deleteBlog;
  }

  async findById(id: string): Promise<Blog | null> {
    const validId = this.validator.validateId(id);
    const findBlog = await this.repository.findById(validId);
    return findBlog;
  }

  async getPublishedBlogs(
    params: PaginationParams
  ): Promise<PaginatedResponse<Blog>> {
    this.validator.validatePagination(params);
    const skip = params.skip || 0;
    const take = params.take || 10;

    const [blogs, totalItems] = await Promise.all([
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
  }

  async getFeaturedBlogs(
    params: PaginationParams
  ): Promise<PaginatedResponse<Blog>> {
    this.validator.validatePagination(params);
    const skip = params.skip || 0;
    const take = params.take || 10;

    const [blogs, totalItems] = await Promise.all([
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
  }

  async getBlogsByStatus(
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED",
    params: PaginationParams
  ): Promise<PaginatedResponse<Blog>> {
    this.validator.validatePagination(params);
    this.validator.validateStatus(status);
    const skip = params.skip || 0;
    const take = params.take || 10;

    const [blogs, totalItems] = await Promise.all([
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
  }

  async searchBlogs(
    searchTerm: string,
    params: PaginationParams
  ): Promise<PaginatedResponse<Blog>> {
    this.validator.validatePagination(params);

    if (!searchTerm || searchTerm.trim().length === 0) {
      throw new ServiceError(
        "Search term is required",
        400,
        "INVALID_SEARCH_TERM"
      );
    }

    const skip = params.skip || 0;
    const take = params.take || 10;

    const [blogs, totalItems] = await Promise.all([
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
  }

  async incrementViews(id: string): Promise<Blog> {
    const validId = this.validator.validateId(id);
    const blog = await this.repository.incrementViews(validId);
    return blog;
  }

  // CATEGORY METHODS

  async createCategory(data: unknown): Promise<Category> {
    const validData = this.validator.validateCreateCategory(data);
    const category = await this.repository.createCategory(validData);
    if (!category)
      throw new ServiceError(
        "Error creating category",
        400,
        "CATEGORY_CREATION_ERROR"
      );
    return category;
  }

  async findCategoryById(id: string): Promise<Category | null> {
    const validId = this.validator.validateId(id);
    const category = await this.repository.findCategoryById(validId);
    return category;
  }

  async getAllCategories(
    params: PaginationParams
  ): Promise<PaginatedResponse<Category>> {
    this.validator.validatePagination(params);
    const skip = params.skip || 0;
    const take = params.take || 10;

    const [categories, totalItems] = await Promise.all([
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
  }

  async updateCategory(id: string, data: unknown): Promise<Category> {
    this.validator.validateId(id);
    const validData = this.validator.validateUpdateCategory({
      data,
      id,
    });

    const category = await this.repository.updateCategory(id, validData);
    return category;
  }

  async deleteCategory(id: string): Promise<Category> {
    this.validator.validateId(id);
    const category = await this.repository.deleteCategory(id);
    return category;
  }

  // BLOG-CATEGORY RELATIONSHIP METHODS

  async assignBlogToCategory(data: unknown): Promise<BlogCategory[]> {
    const validData = this.validator.validateBulkAssign(data);
    const assigned = await this.repository.assignBlogToCategory(
      validData.items
    );
    return assigned;
  }

  async removeBlogFromCategory(data: unknown): Promise<BlogCategory[]> {
    const validData = this.validator.validateBulkRemove(data);
    const removed = await this.repository.removeBlogFromCategory(
      validData.items
    );
    return removed;
  }

  async getBlogsByCategory(
    categoryId: string,
    params: PaginationParams
  ): Promise<PaginatedResponse<Blog>> {
    this.validator.validatePagination(params);
    this.validator.validateId(categoryId);

    const skip = params.skip || 0;
    const take = params.take || 10;

    const [blogs, totalItems] = await Promise.all([
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
  }

  async getCategoriesByBlog(
    blogId: string,
    params: PaginationParams
  ): Promise<PaginatedResponse<Category>> {
    this.validator.validatePagination(params);
    this.validator.validateId(blogId);

    const skip = params.skip || 0;
    const take = params.take || 10;

    const [categories, totalItems] = await Promise.all([
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
  }
}