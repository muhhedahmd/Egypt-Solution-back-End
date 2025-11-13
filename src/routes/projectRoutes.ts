import { Router } from "express";
import { projectController } from "../controllers/projectController";
import { requireAuthv2 } from "../middlewares/auth";

export class projectRoutes {
  private router: Router;
  constructor(private controller: projectController) {
    this.router = Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    const asyncHandler = (fn: any) => (req: any, res: any, next: any) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };

    // Get featured projects
    this.router.get(
      "/featured/all",
      asyncHandler(this.controller.getFeaturedProjects.bind(this.controller))
    );

    // Get projects by status
    this.router.get(
      "/status/:status",
      asyncHandler(this.controller.getProjectsByStatus.bind(this.controller))
    );

    // Search projects
    this.router.get(
      "/search/query",
      asyncHandler(this.controller.searchProjects.bind(this.controller))
    );
    
    // TECHNOLOGY ROUTES
    this.router.get(
      "/tech-search",
      asyncHandler(this.controller.techSearch.bind(this.controller))
    );

    // Get all technologies
    this.router.get(
      "/technologies/all",
      asyncHandler(this.controller.getAllTechnologies.bind(this.controller))
    );

    // Create new technology
    this.router.post(
      "/technology",
      asyncHandler(requireAuthv2),
      asyncHandler(this.controller.createTechnology.bind(this.controller))
    );

    // Get technology by ID
    this.router.get(
      "/technology/:id",
      asyncHandler(this.controller.getTechnologyById.bind(this.controller))
    );

    // Update technology
    this.router.put(
      "/technology/:id",
      asyncHandler(requireAuthv2),
      asyncHandler(this.controller.updateTechnology.bind(this.controller))
    );

    // Delete technology
    this.router.delete(
      "/technology/:id",
      asyncHandler(requireAuthv2),
      asyncHandler(this.controller.deleteTechnology.bind(this.controller))
    );

    // Get technologies by category
    this.router.get(
      "/technologies/category/:category",
      asyncHandler(
        this.controller.getTechnologiesByCategory.bind(this.controller)
      )
    );

    // Get all categories
    this.router.get(
      "/categories/all",
      asyncHandler(this.controller.getAllCategories.bind(this.controller))
    );

    // PROJECT-TECHNOLOGY RELATIONSHIP ROUTES

    // Assign projects to technology (bulk)
    this.router.post(
      "/assign-technology",
      asyncHandler(requireAuthv2),
      asyncHandler(
        this.controller.assignProjectToTechnology.bind(this.controller)
      )
    );

    // Remove projects from technology (bulk)
    this.router.delete(
      "/remove-technology",
      asyncHandler(requireAuthv2),
      asyncHandler(
        this.controller.removeProjectFromTechnology.bind(this.controller)
      )
    );

    // cerate project and assign techs 
    this.router.post(
      "/projects-assign-technologies",
      asyncHandler(requireAuthv2),
      asyncHandler(
        this.controller.createProjectAndAssignTechnology.bind(this.controller)
      )
    );

    // Create project with technologies
    this.router.post(
      "/projects-with-technologies",
      asyncHandler(requireAuthv2),
      asyncHandler(
        this.controller.createProjectWithTechnologies.bind(this.controller)
      )
    );

    this.router.post(
      "/technology-with-projects",
      asyncHandler(requireAuthv2),
      asyncHandler(
        this.controller.createTechnologyWithProjects.bind(this.controller)
      )
    );

    // Get all projects by technology ID
    this.router.get(
      "/by-technology/:id",
      asyncHandler(
        this.controller.getProjectsByTechnology.bind(this.controller)
      )
    );

    // Get all technologies by project ID
    this.router.get(
      "/project-technologies/:id",
      asyncHandler(
        this.controller.getTechnologiesByProject.bind(this.controller)
      )
    );

    this.router.get(
      "/",
      asyncHandler(this.controller.getAllProjects.bind(this.controller))
    );

    // Get single project by ID
    this.router.get(
      "/:slug",
      asyncHandler(this.controller.getProjectBySlugFull.bind(this.controller))
    );

    // Create new project (with image upload)
    this.router.post(
      "/",
      asyncHandler(requireAuthv2),
      // upload.single("image"),
      asyncHandler(this.controller.createProject.bind(this.controller))
    );

    // Update project (with optional image upload)
    this.router.put(
      "/:id",
      asyncHandler(requireAuthv2),
      asyncHandler(this.controller.updateProject.bind(this.controller))
    );

    // Delete project
    this.router.delete(
      "/:id",
      asyncHandler(requireAuthv2),
      asyncHandler(this.controller.deleteProject.bind(this.controller))
    );
  }
  getRoutes() {
    return this.router;
  }
}
