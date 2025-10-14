import { Router } from "express"
import { PrismaClientConfig } from "../../config/prisma"
import { SlideShowValidator } from "../../validtation/slideShow-schema"
import { slideShowLogic } from "./slideShow.logic"
import { slideShowRepository } from "./slideShow.repostory"
import { slideShowRoutes } from "../../routes/slideShowRoutes"
import { slideShowController } from "../../controllers/slideShowController"


export class slideShowModules {

        private repository : slideShowRepository 
        private validator : SlideShowValidator
        private service : slideShowLogic
        private routes : slideShowRoutes
        private controller : slideShowController
        constructor(
            prisma : PrismaClientConfig
        ){
            this.repository =  new slideShowRepository(prisma);
            this.validator = new SlideShowValidator();
            this.service = new slideShowLogic(this.repository, this.validator);
            this.controller = new slideShowController(this.service);
            this.routes = new slideShowRoutes(this.controller);
        }
        getRoutes( ) : Router {
            return this.routes.getRoutes();
        }

}