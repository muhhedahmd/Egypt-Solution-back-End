import { z } from "zod";
import {
  CreateProjectDTO,
  CreateTechnologyDTO,
  UpdateProjectDTO,
} from "../types/project";
import { ServiceError, ServiceValidationError } from "../errors/services.error";
import { ZodError } from "zod/v4";

export class ProjectsValidator {
  private createSchema = z.object({
    title: z
      .string()
      .min(3, "Title must be at least 3 characters")
      .max(200, "Title must be less than 200 characters"),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters")
      .max(500, "Description must be less than 500 characters")
      .optional(),
    richDescription: z
      .string()
      .min(10, "Rich description must be at least 10 characters"),
    clientName: z.string().max(100).optional(),
    clientCompany: z.string().max(100).optional(),
    projectUrl: z.string().url("Invalid project URL").optional(),
    githubUrl: z.string().url("Invalid GitHub URL").optional(),
    status: z
      .enum(["COMPLETED", "IN_PROGRESS", "PLANNING", "ON_HOLD"])
      .default("COMPLETED"),
    startDate: z.string().datetime().optional().or(z.date().optional()),
    endDate: z.string().datetime().optional().or(z.date().optional()),
    image: z.instanceof(Buffer).optional(),
    isFeatured: z.boolean().default(false),
    order: z.number().int().min(0).default(0),
    technologyIds: z.array(z.string()).optional(),
    serviceIds: z.array(z.string()).optional(),
  });

  private updateSchema = z.object({
    id: z.string().cuid("Invalid project ID"),
    title: z.string().min(3).max(200).optional(),
    description: z.string().min(10).max(500).optional(),
    richDescription: z.string().min(10).optional(),
    clientName: z.string().max(100).optional(),
    clientCompany: z.string().max(100).optional(),
    projectUrl: z.string().url("Invalid project URL").optional(),
    githubUrl: z.string().url("Invalid GitHub URL").optional(),
    status: z
      .enum(["COMPLETED", "IN_PROGRESS", "PLANNING", "ON_HOLD"])
      .optional(),
    startDate: z.string().datetime().optional().or(z.date().optional()),
    endDate: z.string().datetime().optional().or(z.date().optional()),
    image: z.instanceof(Buffer).optional(),
    imageState: z.enum(["KEEP", "REMOVE", "UPDATE"]).optional().default("KEEP"),
    slug: z.string().optional(),
    isFeatured: z.boolean().optional(),

    order: z.number().int().min(0).optional(),
    technologyIds: z.array(z.string()).optional(),
    serviceIds: z.array(z.string()).optional(),
  });

  validateCreate(data: unknown): CreateProjectDTO {
    try {
      return this.createSchema.parse(data);
    } catch (error) {
      throw new ServiceError(
        "Invalid project data",
        undefined,
        "ProjectValidationError"
      );
    }
  }

  validateUpdate(data: unknown): UpdateProjectDTO {
    try {
      return this.updateSchema.parse(data);
    } catch (error) {
      throw new ServiceValidationError(
        "Invalid update data",
        undefined,
        "ProjectValidationError"
      );
    }
  }

  private createTechnologySchema = z.object({
    name: z.string().min(2).max(100),
    icon: z.string().optional(),
    category: z.string().max(50).optional(),
  });

  private paginationSchema = z.object({
    skip: z.number().int().min(0).default(0),
    take: z.number().int().min(1).max(100).default(10),
  });

  private bulkAssignSchema = z.object({
    items: z.array(
      z.object({
        projectId: z.string(),
        technologyId: z.string(),
      })
    ),
  });

  private bulkRemoveSchema = z.object({
    items: z.array(
      z.object({
        projectId: z.string(),
        technologyId: z.string(),
      })
    ),
  });

  private createTechWithProjectsSchema = z.object({
    technology: z.object({
      name: z.string().min(2).max(100),
      icon: z.string().optional(),
      category: z.string().max(50).optional(),
    }),
    projects: z.array(
      z.object({
        title: z.string().min(3).max(200),
        description: z.string().min(10).max(500).optional(),
        richDescription: z.string().min(10),
        clientName: z.string().max(100).optional(),
        clientCompany: z.string().max(100).optional(),
        projectUrl: z.string().url().optional(),
        githubUrl: z.string().url().optional(),
        status: z
          .enum(["COMPLETED", "IN_PROGRESS", "PLANNING", "ON_HOLD"])
          .default("COMPLETED"),
        startDate: z.string().datetime().optional().or(z.date().optional()),
        endDate: z.string().datetime().optional().or(z.date().optional()),
        image: z.instanceof(Buffer).optional(),
        isFeatured: z.boolean().default(false),
        order: z.number().int().min(0).default(0),
      })
    ),
  });

  validateCreateTechnology(data: unknown): CreateTechnologyDTO {
    try {
      return this.createTechnologySchema.parse(data);
    } catch (error) {
      throw new ServiceValidationError("Invalid technology data");
    }
  }

  validatePagination(data: unknown) {
    try {
      return this.paginationSchema.parse(data);
    } catch (error) {
      throw new ServiceValidationError("Invalid pagination parameters");
    }
  }

  validateBulkAssign(data: unknown) {
    try {
      return this.bulkAssignSchema.parse(data);
    } catch (error) {
      throw new ServiceValidationError("Invalid bulk assign data");
    }
  }

  validateUpdateTechnology(data: unknown) {
    try {
      return this.createTechnologySchema.partial().parse(data);
    } catch (error) {
      throw new ServiceValidationError("Invalid update technology data");
    }
  }

  validateBulkRemove(data: unknown) {
    try {
      return this.bulkRemoveSchema.parse(data);
    } catch (error) {
      throw new ServiceValidationError("Invalid bulk remove data");
    }
  }

  validateCreateTechWithProjects(data: unknown) {
    try {
      return this.createTechWithProjectsSchema.parse(data);
    } catch (error: any) {
        console.log({issues : error.issues});
      if (error instanceof ZodError) {

        throw new ServiceValidationError(
          "Invalid technology with projects data",
          undefined,
          "UNKNOWN_VALIDATION_ERROR"
        );
    }
    throw new ServiceValidationError(
      "Invalid technology with projects data",
      error.issues.map((issue: any) => issue.message).join(", "),
      "UNKNOWN_VALIDATION_ERROR"
    );
    }
  }

  validateId(id: string): string {
    if (!id || typeof id !== "string") {
      throw new ServiceValidationError("Invalid ID");
    }
    return id;
  }
}
