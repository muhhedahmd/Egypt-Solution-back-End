// FILE: src/controllers/blogController.ts

import { NextFunction, Request, Response } from "express";
import { blogLogic } from "../services/blog/blog.logic";

export class blogController {
  constructor(private logic: blogLogic) {}

  // ============================================
  // BLOG ENDPOINTS
  // ============================================

  async createBlog(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body;
      const file = req.files; // From multer

      // Get authorId from authenticated user
      const authorId = req?.user?.id

      const newBlog = await this.logic.create({
        ...body,
        image: Array.isArray(file) && file.length > 0 ? file[0].buffer :  undefined,
        authorId,
        isFeatured: body.isFeatured === "true" ? true : false,
        status: body.status || "DRAFT",
        publishedAt: body.publishedAt ? new Date(body.publishedAt) : undefined,
        readingTime: body.readingTime ? Number(body.readingTime) : undefined,
        categoryIds: body.categoryIds
          ? JSON.parse(body.categoryIds)
          : undefined,
      });

      return res.status(201).json({
        success: true,
        message: "Blog created successfully",
        data: newBlog,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllBlogs(req: Request, res: Response, next: NextFunction) {
    try {
      const { skip, take } = req.query;

      const blogs = await this.logic.getAllBlogs({
        skip: Number(skip) || 0,
        take: Number(take) || 10,
      });

      return res.status(200).json({
        success: true,
        message: "Blogs fetched successfully",
        ...blogs,
      });
    } catch (error) {
      next(error);
    }
  }

  async getBlogById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const blog = await this.logic.findById(id);

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
    } catch (error) {
      next(error);
    }
  }

  async updateBlog(req: Request, res: Response, next: NextFunction) {

    try {
      const body = req.body;
      const id = req.params.id;
      const file = req.files; // From multer


      const updated = await this.logic.update({
        ...body,
        id,
        image: Array.isArray(file) && file.length > 0 ? file[0].buffer : undefined,
        imageState: body.imageState || "KEEP",
        isFeatured: body.isFeatured === "true" ? true : false,
        status: body.status || undefined,
        publishedAt: body.publishedAt ? new Date(body.publishedAt) : undefined,
        readingTime: body.readingTime ? Number(body.readingTime) : undefined,
        categoryIds: body.categoryIds
          ? JSON.parse(body.categoryIds)
          : undefined,
      });

      return res.status(200).json({
        success: true,
        message: "Blog updated successfully",
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteBlog(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const deleted = await this.logic.delete(id);

      return res.status(200).json({
        success: true,
        message: "Blog deleted successfully",
        data: deleted,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPublishedBlogs(req: Request, res: Response, next: NextFunction) {
    try {
      const { skip, take } = req.query;

      const blogs = await this.logic.getPublishedBlogs({
        skip: Number(skip) || 0,
        take: Number(take) || 10,
      });

      return res.status(200).json({
        success: true,
        message: "Published blogs fetched successfully",
        ...blogs,
      });
    } catch (error) {
      next(error);
    }
  }

  async getFeaturedBlogs(req: Request, res: Response, next: NextFunction) {
    try {
      const { skip, take } = req.query;

      const blogs = await this.logic.getFeaturedBlogs({
        skip: Number(skip) || 0,
        take: Number(take) || 10,
      });

      return res.status(200).json({
        success: true,
        message: "Featured blogs fetched successfully",
        ...blogs,
      });
    } catch (error) {
      next(error);
    }
  }

  async getBlogsByStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { skip, take } = req.query;
      const { status } = req.params;

      if (!["DRAFT", "PUBLISHED", "ARCHIVED"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status. Must be DRAFT, PUBLISHED, or ARCHIVED",
        });
      }

      const blogs = await this.logic.getBlogsByStatus(
        status as "DRAFT" | "PUBLISHED" | "ARCHIVED",
        {
          skip: Number(skip) || 0,
          take: Number(take) || 10,
        }
      );

      return res.status(200).json({
        success: true,
        message: `Blogs with status ${status} fetched successfully`,
        ...blogs,
      });
    } catch (error) {
      next(error);
    }
  }

  async searchBlogs(req: Request, res: Response, next: NextFunction) {
    try {
      const { skip, take, q } = req.query;

      if (!q || typeof q !== "string") {
        return res.status(400).json({
          success: false,
          message: "Search query 'q' is required",
        });
      }

      const blogs = await this.logic.searchBlogs(q, {
        skip: Number(skip) || 0,
        take: Number(take) || 10,
      });

      return res.status(200).json({
        success: true,
        message: "Blog search results",
        ...blogs,
      });
    } catch (error) {
      next(error);
    }
  }

  async incrementViews(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const blog = await this.logic.incrementViews(id);

      return res.status(200).json({
        success: true,
        message: "Blog views incremented",
        data: blog,
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // CATEGORY ENDPOINTS
  // ============================================

  async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body;
      const newCategory = await this.logic.createCategory({
        name: body.name,
      });

      return res.status(201).json({
        success: true,
        message: "Category created successfully",
        data: newCategory,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const { skip, take } = req.query;

      const categories = await this.logic.getAllCategories({
        skip: Number(skip) || 0,
        take: Number(take) || 10,
      });

      return res.status(200).json({
        success: true,
        message: "Categories fetched successfully",
        ...categories,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCategoryById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const category = await this.logic.findCategoryById(id);

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
    } catch (error) {
      next(error);
    }
  }

  async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const body = req.body;

      const updated = await this.logic.updateCategory(id, {
        name: body.name,
      });

      return res.status(200).json({
        success: true,
        message: "Category updated successfully",
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const deleted = await this.logic.deleteCategory(id);

      return res.status(200).json({
        success: true,
        message: "Category deleted successfully",
        data: deleted,
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // BLOG-CATEGORY RELATIONSHIP ENDPOINTS
  // ============================================

  async assignBlogToCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body;
      const assigned = await this.logic.assignBlogToCategory(body);

      return res.status(200).json({
        success: true,
        message: "Blogs assigned to category successfully",
        data: assigned,
      });
    } catch (error) {
      next(error);
    }
  }

  async removeBlogFromCategory(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const body = req.body;
      const removed = await this.logic.removeBlogFromCategory(body);

      return res.status(200).json({
        success: true,
        message: "Blogs removed from category successfully",
        data: removed,
      });
    } catch (error) {
      next(error);
    }
  }

  async getBlogsByCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { skip, take } = req.query;

      const blogs = await this.logic.getBlogsByCategory(id, {
        skip: Number(skip) || 0,
        take: Number(take) || 10,
      });

      return res.status(200).json({
        success: true,
        message: "Blogs by category fetched successfully",
        ...blogs,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCategoriesByBlog(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { skip, take } = req.query;

      const categories = await this.logic.getCategoriesByBlog(id, {
        skip: Number(skip) || 0,
        take: Number(take) || 10,
      });

      return res.status(200).json({
        success: true,
        message: "Categories by blog fetched successfully",
        ...categories,
      });
    } catch (error) {
      next(error);
    }
  }
}
