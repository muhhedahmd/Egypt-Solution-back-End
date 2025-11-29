"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.slideShowModules = void 0;
const slideShow_schema_1 = require("../../validtation/slideShow-schema");
const slideShow_logic_1 = require("./slideShow.logic");
const slideShow_repostory_1 = require("./slideShow.repostory");
const slideShowRoutes_1 = require("../../routes/slideShowRoutes");
const slideShowController_1 = require("../../controllers/slideShowController");
class slideShowModules {
    constructor(prisma) {
        this.repository = new slideShow_repostory_1.slideShowRepository(prisma);
        this.validator = new slideShow_schema_1.SlideShowValidator();
        this.service = new slideShow_logic_1.slideShowLogic(this.repository, this.validator);
        this.controller = new slideShowController_1.slideShowController(this.service);
        this.routes = new slideShowRoutes_1.slideShowRoutes(this.controller);
    }
    getRoutes() {
        return this.routes.getRoutes();
    }
}
exports.slideShowModules = slideShowModules;
