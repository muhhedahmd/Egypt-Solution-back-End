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
        this.router.get("/", this.controller.getAllServices.bind(this.controller));
        this.router.get("/check-order", auth_1.requireAuthv2, this.controller.isValidOrder.bind(this.controller));
        this.router.get("/search", auth_1.requireAuthv2, this.controller.SearchServices.bind(this.controller));
        this.router.post("/", auth_1.requireAuthv2, this.controller.createService.bind(this.controller));
        this.router.get("/slug/:slug", this.controller.getServiceBySlug.bind(this.controller));
        this.router.delete("/:id", auth_1.requireAuthv2, this.controller.deleteService.bind(this.controller));
        this.router.put("/:id", auth_1.requireAuthv2, this.controller.updateService.bind(this.controller));
        this.router.get("/:id", this.controller.getServiceById.bind(this.controller));
    }
    getRouter() {
        return this.router;
    }
}
exports.serviceRoutes = serviceRoutes;
