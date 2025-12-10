"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeroModule = void 0;
const hero_repostery_1 = require("./hero.repostery");
const hero_logic_1 = require("./hero.logic");
const hero_validation_schema_1 = require("../../errors/schema/hero.validation.schema");
const heroController_1 = require("../../controllers/heroController");
const heroRoutes_1 = require("../../routes/heroRoutes");
class HeroModule {
    constructor(prisma) {
        this.repository = new hero_repostery_1.HeroRepository(prisma);
        this.validator = new hero_validation_schema_1.HeroValidator();
        this.logic = new hero_logic_1.HeroLogic(this.repository, this.validator);
        this.controller = new heroController_1.HeroController(this.logic);
        this.routes = new heroRoutes_1.HeroRoutes(this.controller);
    }
    getRoutes() {
        return this.routes.getRouter();
    }
}
exports.HeroModule = HeroModule;
