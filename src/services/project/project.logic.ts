import { randomUUID } from "crypto";
import { ProjectsValidator } from "../../validtation/project-schema";
import { projectRepository } from "./project.repostory";
import slugify from "slugify";
import { ServiceError } from "../../errors/services.error";
import { PaginatedResponse, PaginationParams } from "../../types/services";
import {
  Project,
  Technology,
  ProjectTechnology,
  ProjectStatus,
} from "@prisma/client";


export class projectLogic {
  constructor(
    private repository: projectRepository,
    private validator: ProjectsValidator
  ) {}

  async getAllProjects(
    params: PaginationParams
  ): Promise<PaginatedResponse<Project>> {
    this.validator.validatePagination(params);
    const skip = params.skip || 0;
    const take = params.take || 10;

    const [projects, totalItems] = await Promise.all([
      this.repository.findMany(skip, take),
      this.repository.count(),
    ]);

    const remainingItems = totalItems - (skip * take + projects.length);

    return {
      data: projects,
      pagination: {
        totalItems,
        remainingItems,
        nowCount: projects.length,
        totalPages: Math.ceil(totalItems / take),
        currentPage: skip + 1,
        pageSize: take,
      },
    };
  }

  async create(data: unknown): Promise<{ project: Project; Image: any }> {
    const dataCreate = this.validator.validateCreate(data);
    const slug = slugify(dataCreate.title + randomUUID().substring(0, 6), {
      lower: true,
    });

    const project = await this.repository.create({ ...dataCreate, slug });
    if (!project)
      throw new ServiceError(
        "error create project",
        400,
        "PROJECT_CREATION_ERROR"
      );

    return project;
  }

  async update(data: unknown): Promise<{ project: Project; Image: any }> {
    const dataUpdate = this.validator.validateUpdate(data);
    const updateProject = await this.repository.update(dataUpdate);
    return updateProject;
  }

  async delete(id: string): Promise<Project> {
    const validId = this.validator.validateId(id);
    const deleteProject = await this.repository.delete(validId);
    return deleteProject;
  }

  async findById(id: string): Promise<Project | null> {
    const validId = this.validator.validateId(id);
    const findProject = await this.repository.findById(validId);
    return findProject;
  }

  // Technology methods
  async createTechnology(data: unknown): Promise<Technology> {
    const validData = this.validator.validateCreateTechnology(data);
    const technology = await this.repository.createTechnology(validData);
    if (!technology)
      throw new ServiceError(
        "error create technology",
        400,
        "TECHNOLOGY_CREATION_ERROR"
      );
    return technology;
  }

  async findTechById(id: string): Promise<Technology | null> {
    const validId = this.validator.validateId(id);
    const technology = await this.repository.findTechById(validId);
    return technology;
  }

  // Project-Technology relationship methods
  async assignProjectToTechnology(data: unknown): Promise<ProjectTechnology[]> {
    const validData = this.validator.validateBulkAssign(data);
    const assigned = await this.repository.assignProjectToTechnolgy(
      validData.items
    );
    return assigned;
  }

  async removeProjectFromTechnology(
    data: unknown
  ): Promise<ProjectTechnology[]> {
    const validData = this.validator.validateBulkRemove(data);
    const removed = await this.repository.removeProjectToTechnolgy(
      validData.items
    );
    return removed;
  }

  async createTechnologyAndProject(data: unknown): Promise<{
    technology: Technology;
    assignToTech: ProjectTechnology[];
  }> {
    const validData = this.validator.validateCreateTechWithProjects(data);

    const result = await this.repository.createTechnologyAndProject({
      CreateTechnology: validData.technology,
      CreateProject: validData.projects.map((p) => {
        const slug = slugify(
          validData.technology.name + randomUUID().substring(0, 6),
          { lower: true }
        );
        return {
          ...p,
          status: p.status,
          slug,
        };
      }),
    });

    return result;
  }

  // Get projects by technology
  async getProjectsByTechnology(
    technologyId: string,
    params: PaginationParams
  ): Promise<PaginatedResponse<ProjectTechnology & { project: Project }>> {
    this.validator.validatePagination(params);
    this.validator.validateId(technologyId);

    const skip = params.skip || 0;
    const take = params.take || 10;

    // You'll need to add this method to repository
    const [projects, totalItems] = await Promise.all([
      this.repository.findProjectsByTechnology(technologyId, skip, take),
      this.repository.findProjectsByTechnologyCount(technologyId),
    ]);

    const remainingItems = totalItems - (skip * take + projects.length);

    return {
      data: projects,
      pagination: {
        totalItems,
        remainingItems,
        nowCount: projects.length,
        totalPages: Math.ceil(totalItems / take),
        currentPage: skip + 1,
        pageSize: take,
      },
    };
  }

  // Get technologies by project
  async getTechnologiesByProject(
    projectId: string,
    params: PaginationParams
  ): Promise<
    PaginatedResponse<ProjectTechnology & { technology: Technology }>
  > {
    this.validator.validatePagination(params);
    this.validator.validateId(projectId);

    const skip = params.skip || 0;
    const take = params.take || 10;

    // You'll need to add this method to repository
    const [technologies, totalItems] = await Promise.all([
      this.repository.findTechnologiesByProject(projectId, skip, take),
      this.repository.findTechnologiesByProjectCount(projectId),
    ]);

    const remainingItems = totalItems - (skip * take + technologies.length);

    return {
      data: technologies,
      pagination: {
        totalItems,
        remainingItems,
        nowCount: technologies.length,
        totalPages: Math.ceil(totalItems / take),
        currentPage: skip + 1,
        pageSize: take,
      },
    };
  }
  async searchProjects(
    searchTerm: string,
    params: PaginationParams
  ): Promise<PaginatedResponse<Project>> {
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

    const [projects, totalItems] = await Promise.all([
      this.repository.searchProjects(searchTerm, skip, take),
      this.repository.countSearchResults(searchTerm),
    ]);

    const remainingItems = totalItems - (skip * take + projects.length);

    return {
      data: projects,
      pagination: {
        totalItems,
        remainingItems,
        nowCount: projects.length,
        totalPages: Math.ceil(totalItems / take),
        currentPage: skip + 1,
        pageSize: take,
      },
    };
  }

  async getFeaturedProjects(
    params: PaginationParams
  ): Promise<PaginatedResponse<Project>> {
    this.validator.validatePagination(params);
    const skip = params.skip || 0;
    const take = params.take || 10;

    const [projects, totalItems] = await Promise.all([
      this.repository.getFeaturedProjects(skip, take),
      this.repository.countFeaturedProjects(),
    ]);

    const remainingItems = totalItems - (skip * take + projects.length);

    return {
      data: projects,
      pagination: {
        totalItems,
        remainingItems,
        nowCount: projects.length,
        totalPages: Math.ceil(totalItems / take),
        currentPage: skip + 1,
        pageSize: take,
      },
    };
  }

  async getProjectsByStatus(

    status: ProjectStatus,
    params: PaginationParams
  ): Promise<PaginatedResponse<Project>> {
    this.validator.validatePagination(params);
    const skip = params.skip || 0;
    const take = params.take || 10;

    const [projects, totalItems] = await Promise.all([
      this.repository.getProjectsByStatus(status, skip, take),
      this.repository.countProjectsByStatus(status),
    ]);

    const remainingItems = totalItems - (skip * take + projects.length);

    return {
      data: projects,
      pagination: {
        totalItems,
        remainingItems,
        nowCount: projects.length,
        totalPages: Math.ceil(totalItems / take),
        currentPage: skip + 1,
        pageSize: take,
      },
    };
  }

  async getAllTechnologies(
    params: PaginationParams
  ): Promise<PaginatedResponse<Technology>> {
    this.validator.validatePagination(params);
    const skip = params.skip || 0;
    const take = params.take || 10;

    const [technologies, totalItems] = await Promise.all([
      this.repository.findManyTechnologies(skip, take),
      this.repository.countTechnologies(),
    ]);

    const remainingItems = totalItems - (skip * take + technologies.length);

    return {
      data: technologies,
      pagination: {
        totalItems,
        remainingItems,
        nowCount: technologies.length,
        totalPages: Math.ceil(totalItems / take),
        currentPage: skip + 1,
        pageSize: take,
      },
    };
  }

  async updateTechnology(id: string, data: unknown): Promise<Technology> {
    this.validator.validateId(id);
    const validData = this.validator.validateUpdateTechnology(data);

    const technology = await this.repository.updateTechnology(id, validData);
    return technology;
  }
  async deleteTechnology(id: string): Promise<Technology> {
    this.validator.validateId(id);
    const technology = await this.repository.deleteTechnology(id);
    return technology;
  }
  async getTechnologiesByCategory(
    category: string,
    params: PaginationParams
  ): Promise<PaginatedResponse<Technology>> {
    this.validator.validatePagination(params);

    if (!category || category.trim().length === 0) {
      throw new ServiceError("Category is required", 400, "INVALID_CATEGORY");
    }

    const skip = params.skip || 0;
    const take = params.take || 10;

    const [technologies, totalItems] = await Promise.all([
      this.repository.getTechnologiesByCategory(category, skip, take),
      this.repository.countTechnologiesByCategory(category),
    ]);

    const remainingItems = totalItems - (skip * take + technologies.length);

    return {
      data: technologies,
      pagination: {
        totalItems,
        remainingItems,
        nowCount: technologies.length,
        totalPages: Math.ceil(totalItems / take),
        currentPage: skip + 1,
        pageSize: take,
      },
    };
  }

  async getAllCategories(): Promise<string[]> {
    const categories = await this.repository.getAllCategories();
    return categories;
  }
}
