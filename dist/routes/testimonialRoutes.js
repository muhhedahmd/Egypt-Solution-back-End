"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestimonialRoutes = void 0;
const express_1 = require("express");
class TestimonialRoutes {
    constructor(controller) {
        this.router = (0, express_1.Router)();
        this.controller = controller;
        this.initializeRoutes();
    }
    initializeRoutes() {
        // GET routes
        this.router.get("/", this.controller.getAllTestimonials.bind(this.controller));
        this.router.get("/search", 
        // requireAuthv2,
        this.controller.SearchTestimonials.bind(this.controller));
        this.router.get("/check-order", 
        // requireAuthv2,
        this.controller.isValidOrder.bind(this.controller));
        this.router.get("/:id", 
        // requireAuthv2,
        this.controller.getTestimonialById.bind(this.controller));
        // POST routes
        this.router.post("/", 
        // requireAuthv2,
        this.controller.createTestimonial.bind(this.controller));
        // PUT routes
        this.router.put("/:id", 
        // requireAuthv2,
        this.controller.updateTestimonial.bind(this.controller));
        // DELETE routes
        this.router.delete("/:id", 
        // requireAuthv2, 
        this.controller.deleteTestimonial.bind(this.controller));
    }
    getRouter() {
        return this.router;
    }
}
exports.TestimonialRoutes = TestimonialRoutes;
