"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectRoutes = void 0;
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
class projectRoutes {
    constructor(controller) {
        this.controller = controller;
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // Get featured projects
        this.router.get("/featured/all", this.controller.getFeaturedProjects.bind(this.controller));
        // Get projects by status
        this.router.get("/status/:status", auth_1.requireAuthv2, this.controller.getProjectsByStatus.bind(this.controller));
        // Search projects
        this.router.get("/search/query", auth_1.requireAuthv2, this.controller.searchProjects.bind(this.controller));
        // TECHNOLOGY ROUTES
        this.router.get("/tech-search", auth_1.requireAuthv2, this.controller.techSearch.bind(this.controller));
        // Get all technologies
        this.router.get("/technologies/all", auth_1.requireAuthv2, this.controller.getAllTechnologies.bind(this.controller));
        // Create new technology
        this.router.post("/technology", auth_1.requireAuthv2, this.controller.createTechnology.bind(this.controller));
        // Get technology by ID
        this.router.get("/technology/:id", this.controller.getTechnologyById.bind(this.controller));
        // Update technology
        this.router.put("/technology/:id", auth_1.requireAuthv2, this.controller.updateTechnology.bind(this.controller));
        // Delete technology
        this.router.delete("/technology/:id", auth_1.requireAuthv2, this.controller.deleteTechnology.bind(this.controller));
        // Get technologies by category
        this.router.get("/technologies/category/:category", auth_1.requireAuthv2, this.controller.getTechnologiesByCategory.bind(this.controller));
        // Get all categories
        this.router.get("/categories/all", auth_1.requireAuthv2, this.controller.getAllCategories.bind(this.controller));
        // PROJECT-TECHNOLOGY RELATIONSHIP ROUTES
        // Assign projects to technology (bulk)
        this.router.post("/assign-technology", auth_1.requireAuthv2, this.controller.assignProjectToTechnology.bind(this.controller));
        // Remove projects from technology (bulk)
        this.router.delete("/remove-technology", auth_1.requireAuthv2, this.controller.removeProjectFromTechnology.bind(this.controller));
        // cerate project and assign techs 
        this.router.post("/projects-assign-technologies", auth_1.requireAuthv2, this.controller.createProjectAndAssignTechnology.bind(this.controller));
        // Create project with technologies
        this.router.post("/projects-with-technologies", auth_1.requireAuthv2, this.controller.createProjectWithTechnologies.bind(this.controller));
        this.router.post("/technology-with-projects", auth_1.requireAuthv2, this.controller.createTechnologyWithProjects.bind(this.controller));
        // Get all projects by technology ID
        this.router.get("/by-technology/:id", auth_1.requireAuthv2, this.controller.getProjectsByTechnology.bind(this.controller));
        // Get all technologies by project ID
        this.router.get("/project-technologies/:id", auth_1.requireAuthv2, this.controller.getTechnologiesByProject.bind(this.controller));
        this.router.get("/", auth_1.requireAuthv2, this.controller.getAllProjects.bind(this.controller));
        // Get single project by ID
        this.router.get("/:slug", auth_1.requireAuthv2, this.controller.getProjectBySlugFull.bind(this.controller));
        // Create new project (with image upload)
        this.router.post("/", auth_1.requireAuthv2, 
        // upload.single("image"),
        this.controller.createProject.bind(this.controller));
        // Update project (with optional image upload)
        this.router.put("/:id", auth_1.requireAuthv2, this.controller.updateProject.bind(this.controller));
        this.router.put("/update-project-bulk/:id", auth_1.requireAuthv2, this.controller.updateProjectWithTechsServices.bind(this.controller));
        // Delete project
        this.router.delete("/:id", auth_1.requireAuthv2, this.controller.deleteProject.bind(this.controller));
    }
    getRoutes() {
        return this.router;
    }
}
exports.projectRoutes = projectRoutes;
