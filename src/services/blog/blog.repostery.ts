

import { randomUUID } from "crypto";
import { PrismaClientConfig } from "../../config/prisma";
import slugify from "slugify";
import {
  CreateBlogDTO,
  UpdateBlogDTO,
  CreateCategoryDTO,
  BlogCategoryDTO,
} from "../../types/blog";
import {
  AssignImageToDBImage,
  deleteImageById,
  txInstance,
  UploadImage,
} from "../../lib/helpers";
import { ServiceError } from "../../errors/services.error";
import { Blog, Category, BlogCategory, Image, Prisma } from "@prisma/client";

export class blogRepository {
  constructor(private prisma: PrismaClientConfig) {}

  async findMany(skip: number, take: number) {
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
  }

  async count() {
    return this.prisma.blog.count();
  }

  async findById(
    id: string,
    prismaTouse?: txInstance
  ): Promise<(Blog & { image: Image | null }) | null> {
    try {
      const blog = await (prismaTouse || this.prisma).blog.findUnique({
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
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new ServiceError("Blog not found", 404, "BLOG_NOT_FOUND");
        }
      }
      console.error(error);
      throw new ServiceError("Error finding blog by ID", 400, "BLOG_GET_ERROR");
    }
  }

  async create(
    data: CreateBlogDTO & { slug: string },
    prismaTouse?: txInstance
  ): Promise<{ blog: Blog; Image: Image | null }> {
    try {
      const transaction = await this.prisma.$transaction(
        async (tx) => {
          const slug = slugify(data.title + randomUUID().substring(0, 8), {
            lower: true,
          });
          if (!slug) throw new Error("Error creating slug");

          let imageId: string | null = null;

          if (data.image) {
            const createImage = await UploadImage(data.image, data.title);
            if (!createImage) throw new Error("Error uploading image");

            const imageToDB = await AssignImageToDBImage(
              {
                imageType: "BLOG",
                blurhash: createImage.blurhash,
                width: createImage.width,
                height: createImage.height,
                data: createImage.data,
              },
              tx
            );

            if (!imageToDB) throw new Error("Error creating image in DB");
            imageId = imageToDB.id;
          }

          const { image: _image, categoryIds, ...createRest } = data;

          const blog = await tx.blog.create({
            data: {
              ...createRest,
              imageId,
              slug,
            },
            include: {
              image: true,
            },
          });

          // Assign categories if provided
          if (categoryIds && categoryIds.length > 0) {
            await Promise.all(
              categoryIds.map((categoryId) =>
                tx.blogCategory.create({
                  data: {
                    blogId: blog.id,
                    categoryId,
                  },
                })
              )
            );
          }

          const { image, ...rest } = blog;
          return { Image: image, blog: rest };
        },
        {
          timeout: 20000,
          maxWait: 5000,
        }
      );
      return transaction;
    } catch (error) {
      console.error(error);
      throw new ServiceError("Error creating blog", 400, "BLOG_CREATE_ERROR");
    }
  }

  async update(
    data: UpdateBlogDTO
  ): Promise<{ blog: Blog; Image: Image | null }> {
    try {
      const transaction = await this.prisma.$transaction(
        async (prismaTx) => {
          let NewImageId: string | null = null;

          if (!data.id) throw new Error("No blog ID provided");

          const blog = await this.findById(data.id, prismaTx);
          if (!blog) throw new Error("Blog not found");

          NewImageId = blog?.imageId || null;

          // Handle image state
          if (data.imageState === "REMOVE") {
            if (blog.imageId) {
              await prismaTx.blog.update({
                where: { id: data.id },
                data: { imageId: null },
              });
              await deleteImageById(blog.imageId, prismaTx);
            }
            NewImageId = null;
          }

          if (data.imageState === "UPDATE") {
            if (blog.imageId) {
              await prismaTx.blog.update({
                where: { id: data.id },
                data: { imageId: null },
              });
              await deleteImageById(blog.imageId, prismaTx);
            }

            if (!data.image) throw new Error("No image provided");

            const createImage = await UploadImage(
              data.image,
              data.title || "update"
            );
            if (!createImage) throw new Error("Error uploading image");

            const imageToDB = await AssignImageToDBImage(
              {
                imageType: "BLOG",
                blurhash: createImage.blurhash,
                width: createImage.width,
                height: createImage.height,
                data: createImage.data,
              },
              prismaTx
            );

            if (!imageToDB) throw new Error("Error creating image in DB");
            NewImageId = imageToDB.id;
          }

          // Generate new slug if title changed
          if (data.title && data.title !== blog.title) {
            const slug = slugify(data.title + randomUUID().substring(0, 8), {
              lower: true,
            });
            data.slug = slug;
          }

          // Handle categories
          if (data.categoryIds) {
            // Remove existing categories
            await prismaTx.blogCategory.deleteMany({
              where: { blogId: data.id },
            });

            // Add new categories
            if (data.categoryIds.length > 0) {
              await Promise.all(
                data.categoryIds.map((categoryId) =>
                  prismaTx.blogCategory.create({
                    data: {
                      blogId: data.id,
                      categoryId,
                    },
                  })
                )
              );
            }
          }

          const updatedBlog = await prismaTx.blog.update({
            where: { id: data.id },
            data: {
              slug: data.slug ?? blog.slug,
              title: data.title ?? blog.title,
              excerpt: data.excerpt ?? blog.excerpt,
              content: data.content ?? blog.content,
              imageId: NewImageId,
              status: data.status ?? blog.status,
              publishedAt: data.publishedAt ?? blog.publishedAt,
              isFeatured: data.isFeatured ?? blog.isFeatured,
              readingTime: data.readingTime ?? blog.readingTime,
              metaTitle: data.metaTitle ?? blog.metaTitle,
              metaDescription: data.metaDescription ?? blog.metaDescription,
              metaKeywords: data.metaKeywords ?? blog.metaKeywords,
            },
            include: { image: true },
          });

          const { image, ...rest } = updatedBlog;
          return { Image: image, blog: rest };
        },
        {
          timeout: 20000,
          maxWait: 5000,
        }
      );

      return transaction;
    } catch (error) {
      console.error(error);
      throw new ServiceError("Error updating blog", 400, "BLOG_UPDATE_ERROR");
    }
  }

  async delete(id: string): Promise<Blog> {
    try {
      const transaction = await this.prisma.$transaction(
        async (prismaTx) => {
          const blog = await prismaTx.blog.findUnique({ where: { id } });
          if (!blog) throw new Error("Blog not found");

          // Remove categories
          await prismaTx.blogCategory.deleteMany({
            where: { blogId: id },
          });

          // Remove image
          await prismaTx.blog.update({
            where: { id },
            data: { imageId: null },
          });
          if (blog.imageId) await deleteImageById(blog.imageId, prismaTx);

          const blogDeleted = await prismaTx.blog.delete({
            where: { id },
          });

          return blog;
        },
        {
          timeout: 20000,
          maxWait: 5000,
        }
      );
      return transaction;
    } catch (error) {
      console.error(error);
      throw new ServiceError("Error deleting blog", 400, "BLOG_DELETE_ERROR");
    }
  }

  async findPublished(skip: number, take: number) {
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
  }

  async countPublished() {
    return this.prisma.blog.count({
      where: {
        status: "PUBLISHED",
        publishedAt: {
          lte: new Date(),
        },
      },
    });
  }

  async findFeatured(skip: number, take: number) {
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
  }

  async countFeatured() {
    return this.prisma.blog.count({
      where: {
        isFeatured: true,
        status: "PUBLISHED",
      },
    });
  }

  async findByStatus(
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED",
    skip: number,
    take: number
  ) {
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
  }

  async countByStatus(status: "DRAFT" | "PUBLISHED" | "ARCHIVED") {
    return this.prisma.blog.count({
      where: { status },
    });
  }

  async searchBlogs(searchTerm: string, skip: number, take: number) {
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
  }

  async countSearchResults(searchTerm: string) {
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
  }

  //   return this.prisma.blog.update({
  //     where: { id },
  //     data: {
  //       views: { increment: 1 },
  //     },
  //   });
  // }

  async findCategoryById(
    id: string,
    tx?: txInstance
  ): Promise<Category | null> {
    try {
      const category = await (tx || this.prisma).category.findUnique({
        where: { id },
      });
      return category;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new ServiceError(
            "Category not found",
            404,
            "CATEGORY_NOT_FOUND"
          );
        }
      }
      console.error(error);
      throw new ServiceError(
        "Error finding category by ID",
        400,
        "CATEGORY_GET_ERROR"
      );
    }
  }

  async createCategory(
    data: CreateCategoryDTO,
    tx?: txInstance
  ): Promise<Category> {
    try {
      const slug = slugify(data.name + randomUUID().substring(0, 8), {
        lower: true,
      });

      const category = await (tx || this.prisma).category.create({
        data: {
          name: data.name,
          slug,
        },
      });
      return category;
    } catch (error) {
      console.error(error);
      throw new ServiceError(
        "Error creating category",
        400,
        "CATEGORY_CREATE_ERROR"
      );
    }
  }

  async findManyCategories(skip: number, take: number) {
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
  }

  async countCategories() {
    return this.prisma.category.count();
  }

  async updateCategory(id: string, data: Partial<CreateCategoryDTO>) {
    try {
      const category = await this.prisma.category.update({
        where: { id },
        data: {
          name: data.name,
        },
      });
      return category;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new ServiceError(
            "Category not found",
            404,
            "CATEGORY_NOT_FOUND"
          );
        }
      }
      console.error(error);
      throw new ServiceError(
        "Error updating category",
        400,
        "CATEGORY_UPDATE_ERROR"
      );
    }
  }

  async deleteCategory(id: string) {
    try {
      // Remove blog-category relationships
      await this.prisma.blogCategory.deleteMany({
        where: { categoryId: id },
      });

      const category = await this.prisma.category.delete({
        where: { id },
      });
      return category;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new ServiceError(
            "Category not found",
            404,
            "CATEGORY_NOT_FOUND"
          );
        }
      }
      console.error(error);
      throw new ServiceError(
        "Error deleting category",
        400,
        "CATEGORY_DELETE_ERROR"
      );
    }
  }


  async assignBlogToCategory(
    data: BlogCategoryDTO[]
  ): Promise<BlogCategory[]> {
    try {
      const transaction = await this.prisma.$transaction(
        async (prismaTx) => {
          const promises = await Promise.all(
            data.map(async (item) => {
              await this.findById(item.blogId, prismaTx);
              await this.findCategoryById(item.categoryId, prismaTx);

              const blogCategory = await prismaTx.blogCategory.create({
                data: {
                  blogId: item.blogId,
                  categoryId: item.categoryId,
                },
                include: { blog: true, category: true },
              });
              return blogCategory;
            })
          );

          return promises;
        },
        {
          timeout: 20000,
          maxWait: 5000,
        }
      );
      return transaction;
    } catch (error) {
      console.error(error);
      throw new ServiceError(
        "Error assigning blog to category",
        400,
        "ASSIGN_BLOG_TO_CATEGORY_ERROR"
      );
    }
  }

  async removeBlogFromCategory(
    data: BlogCategoryDTO[]
  ): Promise<BlogCategory[]> {
    try {
      const transaction = await this.prisma.$transaction(
        async (prismaTx) => {
          const promises = await Promise.all(
            data.map(async (item) => {
              await this.findById(item.blogId, prismaTx);
              await this.findCategoryById(item.categoryId, prismaTx);

              const blogCategory = await prismaTx.blogCategory.delete({
                where: {
                  blogId_categoryId: {
                    blogId: item.blogId,
                    categoryId: item.categoryId,
                  },
                },
              });
              return blogCategory;
            })
          );

          return promises;
        },
        {
          timeout: 20000,
          maxWait: 5000,
        }
      );
      return transaction;
    } catch (error) {
      console.error(error);
      throw new ServiceError(
        "Error removing blog from category",
        400,
        "REMOVE_BLOG_FROM_CATEGORY_ERROR"
      );
    }
  }

  async findBlogsByCategory(categoryId: string, skip: number, take: number) {
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
  }

  async countBlogsByCategory(categoryId: string) {
    return this.prisma.blog.count({
      where: {
        categories: {
          some: {
            categoryId,
          },
        },
      },
    });
  }

  async findCategoriesByBlog(blogId: string, skip: number, take: number) {
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
  }

  async countCategoriesByBlog(blogId: string) {
    return this.prisma.category.count({
      where: {
        blogs: {
          some: {
            blogId,
          },
        },
      },
    });
  }
}

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