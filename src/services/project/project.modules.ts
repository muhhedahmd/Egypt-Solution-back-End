import { Router } from "express"
import { PrismaClientConfig } from "../../config/prisma"
import { projectRepository } from "./project.repostory"
import {  projectController} from "../../controllers/projectController"
import { projectLogic } from "./project.logic"
import { projectRoutes } from "../../routes/projectRoutes"
import { ProjectsValidator } from "../../validtation/project-schema"


export class projectModules {

        private repository : projectRepository 
        private validator : ProjectsValidator
        private service : projectLogic
        private routes : projectRoutes
        private controller : projectController
        constructor(
            prisma : PrismaClientConfig
        ){
            this.repository =  new projectRepository(prisma);
            this.validator = new ProjectsValidator();
            this.service = new projectLogic(this.repository, this.validator);
            this.controller = new projectController(this.service);
            this.routes = new projectRoutes(this.controller);
        }
        getRoutes( ) : Router {
            return this.routes.getRoutes();
        }

}