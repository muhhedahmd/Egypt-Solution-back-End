import { Router } from "express"
import { PrismaClientConfig } from "../../config/prisma"
import { projectRepository } from "./project.repostory"
import { slideShowRoutes } from "../../routes/slideShowRoutes"
import {  projectController} from "../../controllers/projectController"
import { projectValidator } from "../../validtation/project-schema"
import { projectLogic } from "./project.logic"
import { projectRoutes } from "../../routes/projectRoutes"


export class projectLogicModules {

        private repository : projectRepository 
        private validator : projectValidator
        private service : projectLogic
        private routes : projectRoutes
        private controller : projectController
        constructor(
            prisma : PrismaClientConfig
        ){
            this.repository =  new projectRepository(prisma);
            this.validator = new projectValidator();
            this.service = new projectLogic(this.repository, this.validator);
            this.controller = new projectController(this.service);
            this.routes = new projectRoutes(this.controller);
        }
        getRoutes( ) : Router {
            return this.routes.getRoutes();
        }

}