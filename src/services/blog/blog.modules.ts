import { Router } from "express"
import { PrismaClientConfig } from "../../config/prisma"
import { blogRepository } from "./blog.repostery"
import { BlogValidator } from "../../errors/blog.error"
import { blogLogic } from "./blog.logic"
import { blogRoutes } from "../../routes/blogRoutes"
import { blogController } from "../../controllers/blogController"


export class blogModules {

        private repository : blogRepository 
        private validator : BlogValidator
        private blog : blogLogic
        private routes : blogRoutes
        private controller : blogController
        constructor(
            prisma : PrismaClientConfig
        ){
            this.repository =  new blogRepository(prisma);
            this.validator = new BlogValidator();
            this.blog = new blogLogic(this.repository, this.validator);
            this.controller = new blogController(this.blog);
            this.routes = new blogRoutes(this.controller);
        }
        getRoutes( ) : Router {
            return this.routes.getRoutes();
        }

}