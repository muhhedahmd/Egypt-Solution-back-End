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
        this.router.get('/', this.controller.getAllTestimonials.bind(this.controller));
        this.router.get('/search', this.controller.SearchTestimonials.bind(this.controller));
        this.router.get('/check-order', this.controller.isValidOrder.bind(this.controller));
        this.router.get('/:id', this.controller.getTestimonialById.bind(this.controller));
        // POST routes
        this.router.post('/', this.controller.createTestimonial.bind(this.controller));
        // PUT routes
        this.router.put('/:id', this.controller.updateTestimonial.bind(this.controller));
        // DELETE routes
        this.router.delete('/:id', this.controller.deleteTestimonial.bind(this.controller));
    }
    getRouter() {
        return this.router;
    }
}
exports.TestimonialRoutes = TestimonialRoutes;
