"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestimonialModule = void 0;
const testimonial_repostery_1 = require("./testimonial.repostery");
const testimonal_validation_schema_1 = require("../../errors/schema/testimonal.validation.schema");
const testimonial_logic_1 = require("./testimonial.logic");
const testimonialController_1 = require("../../controllers/testimonialController");
const testimonialRoutes_1 = require("../../routes/testimonialRoutes");
class TestimonialModule {
    constructor(prisma) {
        this.repository = new testimonial_repostery_1.TestimonialRepository(prisma);
        this.validator = new testimonal_validation_schema_1.TestimonialValidator();
        this.logic = new testimonial_logic_1.TestimonialLogic(this.repository, this.validator);
        this.controller = new testimonialController_1.TestimonialController(this.logic);
        this.routes = new testimonialRoutes_1.TestimonialRoutes(this.controller);
    }
    getRoutes() {
        return this.routes.getRouter();
    }
}
exports.TestimonialModule = TestimonialModule;
