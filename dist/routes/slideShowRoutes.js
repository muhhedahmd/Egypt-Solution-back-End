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
        this.router.post("/get-paginated-slides/:id", this.controller.getPaginatedSlides.bind(this.controller));
        // 💀💀💀💀  30s res
        // this.router.post(
        //     "/with-slides",
        // requireAuthv2,
        //
        //     this.controller.getSlideShowWithSlides.bind(this.controller)
        //
        this.router.get("/", this.controller.getAllSlideShows.bind(this.controller));
        this.router.get("/all-minimal", auth_1.requireAuthv2, this.controller.getAllSlideShowsMinmal.bind(this.controller));
        // *** & ####
        this.router.post("/bulk-operations/:id", auth_1.requireAuthv2, this.controller.bulkSlideOperations.bind(this.controller));
        // ***
        this.router.post("/create-attach-many", auth_1.requireAuthv2, this.controller.CreateAndAttachMany.bind(this.controller));
        // ***
        this.router.post("/update-attach-many", auth_1.requireAuthv2, this.controller.UpdateAndAttachMany.bind(this.controller));
        this.router.post("/", auth_1.requireAuthv2, this.controller.createSlideShow.bind(this.controller));
        this.router.post("/attach-many", auth_1.requireAuthv2, this.controller.attachMany.bind(this.controller));
        this.router.get("/grouped-type/:id", auth_1.requireAuthv2, this.controller.getAttachedsGrouped.bind(this.controller));
        this.router.get("/by-type", auth_1.requireAuthv2, this.controller.getSlideShowsByType.bind(this.controller));
        this.router.get("/attaches-by-type/:id", auth_1.requireAuthv2, this.controller.getAttachesByType.bind(this.controller));
        this.router.delete("/detach-many", auth_1.requireAuthv2, this.controller.deAttachMany.bind(this.controller));
        this.router.put("/reorder-bulk", auth_1.requireAuthv2, this.controller.reorderBulkSlideShow.bind(this.controller));
        this.router.get("/:id", this.controller.getSlideShowById.bind(this.controller));
        this.router.delete("/:id", auth_1.requireAuthv2, this.controller.deleteSlideShow.bind(this.controller));
        this.router.put("/:id", auth_1.requireAuthv2, this.controller.updateSlideShow.bind(this.controller));
        // reorderBulkSlideShow
    }
    getRoutes() {
        return this.router;
    }
}
exports.slideShowRoutes = slideShowRoutes;
