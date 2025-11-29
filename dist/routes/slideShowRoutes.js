"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.slideShowRoutes = void 0;
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
class slideShowRoutes {
    constructor(controller) {
        this.controller = controller;
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        const asyncHandler = (fn) => (req, res, next) => {
            Promise.resolve(fn(req, res, next)).catch(next);
        };
        this.router.get("/", asyncHandler(this.controller.getAllSlideShows.bind(this.controller)));
        this.router.get("/all-minimal", asyncHandler(this.controller.getAllSlideShows.bind(this.controller)));
        // ***
        this.router.post("/create-attach-many", asyncHandler(auth_1.requireAuthv2), asyncHandler(this.controller.CreateAndAttachMany.bind(this.controller)));
        this.router.post("/", asyncHandler(auth_1.requireAuthv2), asyncHandler(this.controller.createSlideShow.bind(this.controller)));
        this.router.post("/attach-many", asyncHandler(auth_1.requireAuthv2), asyncHandler(this.controller.attachMany.bind(this.controller)));
        this.router.get("/grouped-type/:id", asyncHandler(auth_1.requireAuthv2), asyncHandler(this.controller.getAttachedsGrouped.bind(this.controller)));
        this.router.get("/by-type", asyncHandler(this.controller.getSlideShowsByType.bind(this.controller)));
        this.router.get("/attaches-by-type/:id", asyncHandler(this.controller.getAttachesByType.bind(this.controller)));
        this.router.delete("/detach-many", asyncHandler(auth_1.requireAuthv2), asyncHandler(this.controller.deAttachMany.bind(this.controller)));
        this.router.get("/:id", asyncHandler(this.controller.getSlideShowById.bind(this.controller)));
        this.router.post("/get-paginated-slides/:id", asyncHandler(this.controller.getPaginatedSlides.bind(this.controller)));
        this.router.delete("/:id", asyncHandler(auth_1.requireAuthv2), asyncHandler(this.controller.deleteSlideShow.bind(this.controller)));
        this.router.put("/:id", asyncHandler(auth_1.requireAuthv2), asyncHandler(this.controller.updateSlideShow.bind(this.controller)));
    }
    getRoutes() {
        return this.router;
    }
}
exports.slideShowRoutes = slideShowRoutes;
