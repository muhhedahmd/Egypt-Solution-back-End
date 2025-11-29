"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectModules = void 0;
const project_repostory_1 = require("./project.repostory");
const projectController_1 = require("../../controllers/projectController");
const project_logic_1 = require("./project.logic");
const projectRoutes_1 = require("../../routes/projectRoutes");
const project_schema_1 = require("../../validtation/project-schema");
class projectModules {
    constructor(prisma) {
        this.repository = new project_repostory_1.projectRepository(prisma);
        this.validator = new project_schema_1.ProjectsValidator();
        this.service = new project_logic_1.projectLogic(this.repository, this.validator);
        this.controller = new projectController_1.projectController(this.service);
        this.routes = new projectRoutes_1.projectRoutes(this.controller);
    }
    getRoutes() {
        return this.routes.getRoutes();
    }
}
exports.projectModules = projectModules;
