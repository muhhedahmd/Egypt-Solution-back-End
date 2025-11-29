"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientRoutes = void 0;
const express_1 = require("express");
// const upload = multer({ storage: multer.memoryStorage() });
class ClientRoutes {
    constructor(controller) {
        this.router = (0, express_1.Router)();
        this.controller = controller;
        this.initializeRoutes();
    }
    initializeRoutes() {
        const asyncHandler = (fn) => (req, res, next) => {
            Promise.resolve(fn(req, res, next)).catch(next);
        };
        this.router.get("/", asyncHandler(this.controller.getAllClients.bind(this.controller)));
        this.router.get("/search", asyncHandler(this.controller.SearchClients.bind(this.controller)));
        this.router.get("/check-order", asyncHandler(this.controller.isValidOrder.bind(this.controller)));
        this.router.get("/:id", asyncHandler(this.controller.getClientById.bind(this.controller)));
        this.router.get("/slug/:slug", asyncHandler(this.controller.getClientBySlug.bind(this.controller)));
        // POST routes
        this.router.post("/", 
        //   upload.any(),
        asyncHandler(this.controller.createClient.bind(this.controller)));
        // PUT routes
        this.router.put("/:id", asyncHandler(this.controller.updateClient.bind(this.controller)));
        // DELETE routes
        this.router.delete("/:id", asyncHandler(this.controller.deleteClient.bind(this.controller)));
    }
    getRouter() {
        return this.router;
    }
}
exports.ClientRoutes = ClientRoutes;
