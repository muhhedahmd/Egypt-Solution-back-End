"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blogRoutes = void 0;
const express_1 = require("express");
class blogRoutes {
    constructor(controller) {
        this.controller = controller;
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // Get all blogs
        //  
    }
    getRoutes() {
        return this.router;
    }
}
exports.blogRoutes = blogRoutes;
