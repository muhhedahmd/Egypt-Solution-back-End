"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactRoutes = void 0;
const express_1 = require("express");
class ContactRoutes {
    constructor(controller) {
        this.router = (0, express_1.Router)();
        this.controller = controller;
        this.initializeRoutes();
    }
    initializeRoutes() {
        const asyncHandler = (fn) => (req, res, next) => {
            Promise.resolve(fn(req, res, next)).catch(next);
        };
        this.router.get("/", asyncHandler(this.controller.getPagnittedContacts.bind(this.controller)));
        this.router.post("/", asyncHandler(this.controller.cerateContact.bind(this.controller)));
        this.router.get("/stats", asyncHandler(this.controller.getStats.bind(this.controller)));
        this.router.get("/search", asyncHandler(this.controller.searchContacts.bind(this.controller)));
        this.router.post("/replay/:id", asyncHandler(this.controller.replay.bind(this.controller)));
        // this.router.put("/:id", asyncHandler(this.controller.updateContact.bind(this.controller)));
        // this.router.delete("/:id", asyncHandler(this.controller.deleteContact.bind(this.controller)));
        this.router.post("/filter", asyncHandler(this.controller.multiFilter.bind(this.controller)));
        this.router.get("/:id", asyncHandler(this.controller.getContactById.bind(this.controller)));
    }
    getRouter() {
        return this.router;
    }
}
exports.ContactRoutes = ContactRoutes;
