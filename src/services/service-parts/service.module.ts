import { Router } from "express";
import { PrismaClientConfig } from "../../config/prisma";
import { ServicesValidator } from "../../validtation/services-schema";
import { ServicesLogic } from "./serices.logic";
import { ServicesRepository } from "./services.Repository";
import { ServicesController } from "../../controllers/servicesController";
import { serviceRoutes } from "../../routes/serviceRoutes";



export class ServicesModule { 
    private repository : ServicesRepository 
    private validator : ServicesValidator 
    private service : ServicesLogic 
    private routes : serviceRoutes
    private controller : ServicesController
    constructor(
        prisma : PrismaClientConfig
    ){
        this.repository =  new ServicesRepository(prisma);
        this.validator = new ServicesValidator();
        this.service = new ServicesLogic(this.repository, this.validator);
        this.controller = new ServicesController(this.service);
        this.routes = new serviceRoutes(this.controller);
    }
    getRoutes( ) : Router {
        return this.routes.getRouter();
    }
}