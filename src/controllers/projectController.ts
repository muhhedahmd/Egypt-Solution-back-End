import { NextFunction, Request, Response } from "express";
import { projectLogic } from "../services/project/project.logic";
import { ProjectStatus } from "@prisma/client";

export class projectController {
  private logic: projectLogic;
  constructor(logic: projectLogic) {
    this.logic = logic;
  }
  async createProject(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body;
      const image =
        Array.isArray(req.files) && req.files.length > 0
          ? req.files[0].buffer
          : null;
      console.log({
        ...body,
        image,
      });

      const newProject = await this.logic.create({
        ...body,
        image: image,
        isFeatured: body.isFeatured === "true" ? true : false,
        order: Number(body.order) || 0,
        status: body.status || "COMPLETED",
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
      });

      return res.status(201).json({
        success: true,
        message: "Project created successfully",
        data: newProject,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllProjects(req: Request, res: Response, next: NextFunction) {
    try {
      const { skip, take } = req.query;

      const projects = await this.logic.getAllProjects({
        skip: Number(skip) || 0,
        take: Number(take) || 10,
      });

      return res.status(200).json({
        success: true,
        message: "Projects fetched successfully",
        ...projects,
      });
    } catch (error) {
      next(error);
    }
  }

  async getProjectById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const project = await this.logic.findById(id);

      if (!project) {
        return res.status(404).json({
          success: false,
          message: `Project with ID ${id} not found`,
        });
      }

      return res.status(200).json({
        success: true,
        message: "Project fetched successfully",
        data: project,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProject(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body;
      const id = req.params.id;
      const file = req.file; // From multer

      const updated = await this.logic.update({
        ...body,
        id,
        image: file?.buffer,
        imageState: body.imageState || "KEEP",
        isFeatured: body.isFeatured === "true" ? true : false,
        order: Number(body.order) || undefined,
        status: body.status || undefined,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
      });

      return res.status(200).json({
        success: true,
        message: "Project updated successfully",
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteProject(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const deleted = await this.logic.delete(id);

      return res.status(200).json({
        success: true,
        message: "Project deleted successfully",
        data: deleted,
      });
    } catch (error) {
      next(error);
    }
  }

  async searchProjects(req: Request, res: Response, next: NextFunction) {
    try {
      const { skip, take, q } = req.query;

      if (!q || typeof q !== "string") {
        return res.status(400).json({
          success: false,
          message: "Search query 'q' is required",
        });
      }

      const projects = await this.logic.searchProjects(q, {
        skip: Number(skip) || 0,
        take: Number(take) || 10,
      });

      return res.status(200).json({
        success: true,
        message: "Projects search results",
        ...projects,
      });
    } catch (error) {
      next(error);
    }
  }

  async getFeaturedProjects(req: Request, res: Response, next: NextFunction) {
    try {
      const { skip, take } = req.query;

      const projects = await this.logic.getFeaturedProjects({
        skip: Number(skip) || 0,
        take: Number(take) || 10,
      });

      return res.status(200).json({
        success: true,
        message: "Featured projects fetched successfully",
        ...projects,
      });
    } catch (error) {
      next(error);
    }
  }

  async getProjectsByStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { skip, take } = req.query;
      const { status } = req.params;

      const projects = await this.logic.getProjectsByStatus(
        status as ProjectStatus,
        {
          skip: Number(skip) || 0,
          take: Number(take) || 10,
        }
      );

      return res.status(200).json({
        success: true,
        message: `Projects with status ${status} fetched successfully`,
        ...projects,
      });
    } catch (error) {
      next(error);
    }
  }

  // TECHNOLOGY ENDPOINTS

  async createTechnology(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body;
      const newTechnology = await this.logic.createTechnology({
        name: body.name,
        icon: body.icon || "",
        category: body.category || "",
      });

      return res.status(201).json({
        success: true,
        message: "Technology created successfully",
        data: newTechnology,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllTechnologies(req: Request, res: Response, next: NextFunction) {
    try {
      const { skip, take } = req.query;

      const technologies = await this.logic.getAllTechnologies({
        skip: Number(skip) || 0,
        take: Number(take) || 10,
      });

      return res.status(200).json({
        success: true,
        message: "Technologies fetched successfully",
        ...technologies,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTechnologyById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const technology = await this.logic.findTechById(id);

      if (!technology) {
        return res.status(404).json({
          success: false,
          message: `Technology with ID ${id} not found`,
        });
      }

      return res.status(200).json({
        success: true,
        message: "Technology fetched successfully",
        data: technology,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateTechnology(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const body = req.body;

      const updated = await this.logic.updateTechnology(id, {
        name: body.name,
        icon: body.icon,
        category: body.category,
      });

      return res.status(200).json({
        success: true,
        message: "Technology updated successfully",
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteTechnology(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const deleted = await this.logic.deleteTechnology(id);

      return res.status(200).json({
        success: true,
        message: "Technology deleted successfully",
        data: deleted,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTechnologiesByCategory(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { category } = req.params;
      const { skip, take } = req.query;

      const technologies = await this.logic.getTechnologiesByCategory(
        category,
        {
          skip: Number(skip) || 0,
          take: Number(take) || 10,
        }
      );

      return res.status(200).json({
        success: true,
        message: `Technologies in category ${category} fetched successfully`,
        ...technologies,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await this.logic.getAllCategories();

      return res.status(200).json({
        success: true,
        message: "Categories fetched successfully",
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  }

  // PROJECT-TECHNOLOGY RELATIONSHIP ENDPOINTS

  async assignProjectToTechnology(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const body = req.body;
      const assigned = await this.logic.assignProjectToTechnology(body);

      return res.status(200).json({
        success: true,
        message: "Projects assigned to technology successfully",
        data: assigned,
      });
    } catch (error) {
      next(error);
    }
  }

  async removeProjectFromTechnology(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const body = req.body;
      const removed = await this.logic.removeProjectFromTechnology(body);

      return res.status(200).json({
        success: true,
        message: "Projects removed from technology successfully",
        data: removed,
      });
    } catch (error) {
      next(error);
    }
  }

  async createTechnologyWithProjects(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const technologyRaw = req.body.technology;
      const projectsRaw = req.body.projects;

      // 🔹 Parse JSON text fields
      const technology = JSON.parse(technologyRaw);
      const projects = JSON.parse(projectsRaw);

      console.log(req.files)
      const FixedBody =  {
        technology: {
          name: technology.name,
          icon: technology.icon,
          category: technology.category,
        },
        projects:  projects.map((p : any) => {
            return { 
                ...p,
                image: Array.isArray(req.files) && req.files ? req.files.find((f) => f.originalname === p.image)?.buffer : undefined,
            }
        })
      }




        const result = await this.logic.createTechnologyAndProject(FixedBody);

      return res.status(201).json({
        success: true,
        message: "Technology and projects created successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getProjectsByTechnology(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const { skip, take } = req.query;

      const projects = await this.logic.getProjectsByTechnology(id, {
        skip: Number(skip) || 0,
        take: Number(take) || 10,
      });

      return res.status(200).json({
        success: true,
        message: "Projects by technology fetched successfully",
        ...projects,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTechnologiesByProject(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const { skip, take } = req.query;

      const technologies = await this.logic.getTechnologiesByProject(id, {
        skip: Number(skip) || 0,
        take: Number(take) || 10,
      });

      return res.status(200).json({
        success: true,
        message: "Technologies by project fetched successfully",
        ...technologies,
      });
    } catch (error) {
      next(error);
    }
  }
}
