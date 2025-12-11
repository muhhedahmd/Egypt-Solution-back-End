"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serviceRoutes = void 0;
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
class serviceRoutes {
    constructor(controller) {
        this.controller = controller;
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        const asyncHandler = (fn) => (req, res, next) => {
            Promise.resolve(fn(req, res, next)).catch(next);
        };
        this.router.get("/", asyncHandler(this.controller.getAllServices.bind(this.controller)));
        this.router.get("/check-order", asyncHandler(this.controller.isValidOrder.bind(this.controller)));
        this.router.get("/search", asyncHandler(this.controller.SearchServices.bind(this.controller)));
        this.router.post("/", asyncHandler(auth_1.requireAuthv2), asyncHandler(this.controller.createService.bind(this.controller)));
        this.router.get("/slug/:slug", asyncHandler(this.controller.getServiceBySlug.bind(this.controller)));
        this.router.delete("/:id", asyncHandler(auth_1.requireAuthv2), asyncHandler(this.controller.deleteService.bind(this.controller)));
        this.router.put("/:id", asyncHandler(auth_1.requireAuthv2), asyncHandler(this.controller.updateService.bind(this.controller)));
        this.router.get("/:id", asyncHandler(this.controller.getServiceById.bind(this.controller)));
    }
    getRouter() {
        return this.router;
    }
}
exports.serviceRoutes = serviceRoutes;
