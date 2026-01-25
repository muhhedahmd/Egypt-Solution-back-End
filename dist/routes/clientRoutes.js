"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientRoutes = void 0;
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
// const upload = multer({ storage: multer.memoryStorage() });
class ClientRoutes {
    constructor(controller) {
        this.router = (0, express_1.Router)();
        this.controller = controller;
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get("/", this.controller.getAllClients.bind(this.controller));
        this.router.get("/search", auth_1.requireAuthv2, this.controller.SearchClients.bind(this.controller));
        this.router.get("/check-order", auth_1.requireAuthv2, this.controller.isValidOrder.bind(this.controller));
        this.router.get("/:id", auth_1.requireAuthv2, this.controller.getClientById.bind(this.controller));
        this.router.get("/slug/:slug", auth_1.requireAuthv2, this.controller.getClientBySlug.bind(this.controller));
        // POST routes
        this.router.post("/", auth_1.requireAuthv2, this.controller.createClient.bind(this.controller));
        // PUT routes
        this.router.put("/:id", auth_1.requireAuthv2, this.controller.updateClient.bind(this.controller));
        // DELETE routes
        this.router.delete("/:id", auth_1.requireAuthv2, this.controller.deleteClient.bind(this.controller));
    }
    getRouter() {
        return this.router;
    }
}
exports.ClientRoutes = ClientRoutes;
