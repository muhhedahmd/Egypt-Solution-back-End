"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.teamRoutes = void 0;
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
// const upload = multer({ storage: multer.memoryStorage() });
class teamRoutes {
    constructor(controller) {
        this.router = (0, express_1.Router)();
        this.controller = controller;
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get("/", this.controller.getAllTeamMembers.bind(this.controller));
        this.router.get("/active", this.controller.getAllTeamMembersActive.bind(this.controller));
        this.router.get("/search", auth_1.requireAuthv2, this.controller.SearchTeamMembers.bind(this.controller));
        this.router.get("/check-order", auth_1.requireAuthv2, this.controller.isValidOrder.bind(this.controller));
        this.router.get("/:id", auth_1.requireAuthv2, this.controller.getTeamMemberById.bind(this.controller));
        this.router.get("/slug/:slug", auth_1.requireAuthv2, this.controller.getTeamMemberBySlug.bind(this.controller));
        // POST routes
        this.router.post("/", auth_1.requireAuthv2, 
        //   upload.any(),
        this.controller.createTeamMember.bind(this.controller));
        // PUT routes
        this.router.put("/:id", auth_1.requireAuthv2, this.controller.updateTeamMember.bind(this.controller));
        // DELETE routes
        this.router.delete("/:id", auth_1.requireAuthv2, this.controller.deleteTeamMember.bind(this.controller));
    }
    getRouter() {
        return this.router;
    }
}
exports.teamRoutes = teamRoutes;
