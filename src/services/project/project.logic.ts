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
  Image,
  Service,
} from "@prisma/client";
import { UpdateProjectDTO } from "../../types/project";

// ==================== PROJECT LOGIC ====================
export class projectLogic {
  constructor(
    private repository: projectRepository,
    private validator: ProjectsValidator
  ) {}

  async getAllProjects(
    lang: "EN" | "AR" = "EN",
    params: PaginationParams
  ): Promise<
    PaginatedResponse<{
      project: Project;
      image: Image | null;
      technologies: Partial<Technology>[];
    }>
  > {
    this.validator.validatePagination(params);
    const skip = params.skip || 0;
    const take = params.take || 10;

    const [projects, totalItems] = await Promise.all([
      this.repository.findMany(lang, skip, take),
      this.repository.count(),
    ]);

    const remainingItems = totalItems - (skip * take + projects.length);

    return {
      data: projects.map((project) => {
        const { image, technologies, ProjectTranslation, ...rest } = project;
        return {
          project: rest,
          image: image || null,
          translation: ProjectTranslation,
          technologies: technologies.map((tech) => tech.technology) || [],
        };
      }),
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

  async create(
    lang: "EN" | "AR" = "EN",
    data: unknown
  ): Promise<{ project: Project; Image: any }> {
    const dataCreate = this.validator.validateCreate(data);
    const slug = slugify(dataCreate.title + randomUUID().substring(0, 6), {
      lower: true,
    });

    const project = await this.repository.create(lang, { ...dataCreate, slug });
    if (!project)
      throw new ServiceError(
        "error create project",
        400,
        "PROJECT_CREATION_ERROR"
      );

    return project;
  }

  async update(
    lang: "EN" | "AR" = "EN",
    data: unknown
  ): Promise<{ project: Project; Image: any }> {
    const dataUpdate = this.validator.validateUpdate(data);
    const updateProject = await this.repository.update(lang, dataUpdate);
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
  async findBySlugFull(
    lang: "EN" | "AR",
    slug: string
  ): Promise<Awaited<ReturnType<typeof this.repository.findBySlugFull>>> {
    // const validId = this.validator.validateSlug(id);
    const findProject = await this.repository.findBySlugFull(lang, slug);
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

  async createProjectAndAssignTechnology(
    lang: "EN" | "AR",
    data: unknown
  ): Promise<
    Awaited<
      ReturnType<typeof this.repository.CreateProjecAndAssignTechnologies>
    >
  > {
    const validData =
      this.validator.validateCreateProjectAndAssignTechsAndServices(data);

    const ProjectWithTechs =
      await this.repository.CreateProjecAndAssignTechnologies(lang, validData);

    if (!ProjectWithTechs)
      throw new ServiceError(
        "error create technology",
        400,
        "TECHNOLOGY_CREATION_ERROR"
      );

    return ProjectWithTechs;
  }

  async findTechById(id: string): Promise<Technology | null> {
    const validId = this.validator.validateId(id);
    const technology = await this.repository.findTechById(validId);
    return technology;
  }

  // Project-Technology relationship methods
  async assignProjectToTechnology(
    lang: "EN" | "AR" = "EN",
    data: unknown
  ): Promise<ProjectTechnology[]> {
    const validData = this.validator.validateBulkAssign(data);
    const assigned = await this.repository.assignProjectToTechnolgy(
      lang,
      validData.items
    );
    return assigned;
  }

  async removeProjectFromTechnology(
    lang: "EN" | "AR" = "EN",
    data: unknown
  ): Promise<ProjectTechnology[]> {
    const validData = this.validator.validateBulkRemove(data);
    const removed = await this.repository.removeProjectToTechnolgy(
      lang,
      validData.items
    );
    return removed;
  }

  async createTechnologyAndProject(
    lang: "EN" | "AR" = "EN",
    data: unknown
  ): Promise<{
    technology: Technology;
    projects: Project[];
  }> {
    const validData = this.validator.validateCreateTechWithProjects(data);

    const result = await this.repository.createTechnologyAndProject(lang, {
      CreateTechnology: {
        icon: validData.technology.icon || null,
        name: validData.technology.name,
        category: validData.technology.category,
      },
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

  async createProjectAndTechnologies(
    data: unknown // : Promise<{ // createdProject: { // project: Project; // Image: Image | null;
  ) // };
  // createdTechnologies: Technology[];
  // }>
  {
    // const validData =
    //   this.validator.validateCreateProjectAndAssignTechs(data);
    // const slug = slugify(
    //   validData.project.title + randomUUID().substring(0, 6),
    //   { lower: true }
    // );
    // const result = await this.repository.createProjectAndTechnologies({
    //   project: { ...validData.project, slug },
    //   technologies: validData.technologies,
    // });
    // return result;
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
  ): Promise<
    PaginatedResponse<
      Awaited<ReturnType<typeof this.repository.searchProjects>>
    >
  > {
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
      data: projects as any,

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

  async techSearch(
    searchTerm: string,
    params: PaginationParams
  ): Promise<PaginatedResponse<Technology>> {
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
    const [technologies, totalItems] = await Promise.all([
      this.repository.searchTechnologies(searchTerm, skip, take),
      this.repository.countSearchResultsTech(searchTerm),
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

  async updateProjectWithTechsServices(
    lang: "EN" | "AR" = "EN",
    data: unknown
  ): Promise<{
    project: Project;
    image: Image | null;
    technologies: Technology[];
    services: Service[];
  }> {
    // Validate input
    const validatedData =
      this.validator.validateUpdateProjectWithTechsServices(data);

    // Extract project data and relationship changes
    const {
      id,
      deletedTechIds,
      newTechIds,
      deletedServiceIds,
      newServiceIds,
      ...projectData
    } = validatedData;

    // Call repository method
    const result = await this.repository.updateProjectWithTechsServices( {
      id,
      projectData: projectData as UpdateProjectDTO,
      deletedTechIds,
      newTechIds,
      deletedServiceIds,
      newServiceIds,
    } , lang);

    return result;
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

  async getAllCategories({
    params,
  }: {
    params: PaginationParams;
  }): Promise<PaginatedResponse<string>> {
    const skip = params.skip || 0;
    const take = params.take || 10;

    const [categories, totalItems] = await Promise.all([
      this.repository.getAllCategories({
        skip,
        take,
      }),
      this.repository.getCountCategories(),
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
  async getCountCategories(): Promise<number> {
    const count = await this.repository.getCountCategories();
    return count;
  }
}
