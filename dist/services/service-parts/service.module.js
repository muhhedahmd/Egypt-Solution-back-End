"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServicesModule = void 0;
const services_schema_1 = require("../../validtation/services-schema");
const serices_logic_1 = require("./serices.logic");
const services_Repository_1 = require("./services.Repository");
const servicesController_1 = require("../../controllers/servicesController");
const serviceRoutes_1 = require("../../routes/serviceRoutes");
class ServicesModule {
    constructor(prisma) {
        this.repository = new services_Repository_1.ServicesRepository(prisma);
        this.validator = new services_schema_1.ServicesValidator();
        this.service = new serices_logic_1.ServicesLogic(this.repository, this.validator);
        this.controller = new servicesController_1.ServicesController(this.service);
        this.routes = new serviceRoutes_1.serviceRoutes(this.controller);
    }
    getRoutes() {
        return this.routes.getRouter();
    }
}
exports.ServicesModule = ServicesModule;
