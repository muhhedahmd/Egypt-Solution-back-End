import { Router } from "express";
import { blogController } from "../controllers/blogController";
import { requireAuthv2 } from "../middlewares/auth";

export class blogRoutes {
  private router: Router;

  constructor(private controller: blogController) {
    this.router = Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    const asyncHandler = (fn: any) => (req: any, res: any, next: any) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };

    // ============================================
    // BLOG ROUTES
    // ============================================

    // Get all blogs
    this.router.get(
      "/",
      asyncHandler(this.controller.getAllBlogs.bind(this.controller))
    );

    // Get single blog by ID
    this.router.get(
      "/:id",
      asyncHandler(this.controller.getBlogById.bind(this.controller))
    );

    // Create new blog (with image upload)
    this.router.post(
      "/",
      asyncHandler(requireAuthv2),
      
      asyncHandler(this.controller.createBlog.bind(this.controller))
    );

    // Update blog (with optional image upload)
    this.router.put(
      "/:id",
      asyncHandler(requireAuthv2),
      
      asyncHandler(this.controller.updateBlog.bind(this.controller))
    );

    // Delete blog
    this.router.delete(
      "/:id",
      asyncHandler(requireAuthv2),
      asyncHandler(this.controller.deleteBlog.bind(this.controller))
    );

    // Get published blogs
    this.router.get(
      "/published/all",
      asyncHandler(this.controller.getPublishedBlogs.bind(this.controller))
    );

    // Get featured blogs
    this.router.get(
      "/featured/all",
      asyncHandler(this.controller.getFeaturedBlogs.bind(this.controller))
    );

    // Get blogs by status
    this.router.get(
      "/status/:status",
      asyncHandler(this.controller.getBlogsByStatus.bind(this.controller))
    );

    // Search blogs
    this.router.get(
      "/search/query",
      asyncHandler(this.controller.searchBlogs.bind(this.controller))
    );

    // Increment blog views
    this.router.post(
      "/:id/views",
      asyncHandler(this.controller.incrementViews.bind(this.controller))
    );

    // ============================================
    // CATEGORY ROUTES
    // ============================================

    // Get all categories
    this.router.get(
      "/categories/all",
      asyncHandler(this.controller.getAllCategories.bind(this.controller))
    );

    // Create new category
    this.router.post(
      "/category",
      asyncHandler(requireAuthv2),
      asyncHandler(this.controller.createCategory.bind(this.controller))
    );

    // Get category by ID
    this.router.get(
      "/category/:id",
      asyncHandler(this.controller.getCategoryById.bind(this.controller))
    );

    // Update category
    this.router.put(
      "/category/:id",
      asyncHandler(requireAuthv2),
      asyncHandler(this.controller.updateCategory.bind(this.controller))
    );

    // Delete category
    this.router.delete(
      "/category/:id",
      asyncHandler(requireAuthv2),
      asyncHandler(this.controller.deleteCategory.bind(this.controller))
    );

    // ============================================
    // BLOG-CATEGORY RELATIONSHIP ROUTES
    // ============================================

    // Assign blogs to category (bulk)
    this.router.post(
      "/assign-category",
      asyncHandler(requireAuthv2),
      asyncHandler(this.controller.assignBlogToCategory.bind(this.controller))
    );

    // Remove blogs from category (bulk)
    this.router.delete(
      "/remove-category",
      asyncHandler(requireAuthv2),
      asyncHandler(this.controller.removeBlogFromCategory.bind(this.controller))
    );

    // Get all blogs by category ID
    this.router.get(
      "/by-category/:id",
      asyncHandler(this.controller.getBlogsByCategory.bind(this.controller))
    );

    // Get all categories by blog ID
    this.router.get(
      "/blog-categories/:id",
      asyncHandler(this.controller.getCategoriesByBlog.bind(this.controller))
    );
  }

  getRoutes(): Router {
    return this.router;
  }
}