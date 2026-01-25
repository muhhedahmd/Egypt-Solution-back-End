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
        this.router.get("/", this.controller.getSettings.bind(this.controller));
        this.router.get("/achivements", this.controller.getMimalStats.bind(this.controller));
        this.router.post("/", auth_1.requireAuthv2, this.controller.createSettings.bind(this.controller));
        this.router.post("/switch-lang", auth_1.requireAuthv2, this.controller.SwitchLang.bind(this.controller));
        this.router.get("/current-lang", auth_1.requireAuthv2, this.controller.currentLang.bind(this.controller));
        this.router.put("/:id", auth_1.requireAuthv2, this.controller.updateSettings.bind(this.controller));
    }
    getRouter() {
        return this.router;
    }
}
exports.companyInfoRoutes = companyInfoRoutes;
