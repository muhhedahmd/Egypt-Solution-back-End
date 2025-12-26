"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyInfoRoutes = void 0;
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
// const multer = multer
class companyInfoRoutes {
    constructor(controller) {
        this.router = (0, express_1.Router)();
        this.controller = controller;
        this.initializeRoutes();
    }
    initializeRoutes() {
        const asyncHandler = (fn) => (req, res, next) => {
            Promise.resolve(fn(req, res, next)).catch(next);
        };
        // asyncHandler(requireAuthv2)
        //  asyncHandler(requireAuthv2),
        this.router.get("/", asyncHandler(this.controller.getSettings.bind(this.controller)));
        this.router.get("/achivements", asyncHandler(this.controller.getMimalStats.bind(this.controller)));
        this.router.post("/", asyncHandler(auth_1.requireAuthv2), asyncHandler(this.controller.createSettings.bind(this.controller)));
        this.router.put("/:id", asyncHandler(auth_1.requireAuthv2), asyncHandler(this.controller.updateSettings.bind(this.controller)));
    }
    getRouter() {
        return this.router;
    }
}
exports.companyInfoRoutes = companyInfoRoutes;
