"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeroRoutes = void 0;
const express_1 = require("express");
class HeroRoutes {
    constructor(controller) {
        this.router = (0, express_1.Router)();
        this.controller = controller;
        this.initializeRoutes();
    }
    initializeRoutes() {
        const asyncHandler = (fn) => (req, res, next) => {
            Promise.resolve(fn(req, res, next)).catch(next);
        };
        // GET routes
        this.router.get('/', asyncHandler(this.controller.getAllHeroes.bind(this.controller)));
        this.router.get('/active', asyncHandler(this.controller.getActiveHero.bind(this.controller)));
        this.router.get('/search', asyncHandler(this.controller.SearchHeroes.bind(this.controller)));
        this.router.get('/:id', asyncHandler(this.controller.getHeroById.bind(this.controller)));
        // POST routes
        this.router.post('/', 
        // upload.any(), // Uncomment when multer is configured
        asyncHandler(this.controller.createHero.bind(this.controller)));
        // PUT routes
        this.router.put('/:id', 
        // upload.any(), // Uncomment when multer is configured
        asyncHandler(this.controller.updateHero.bind(this.controller)));
        // DELETE routes
        this.router.delete('/:id', asyncHandler(this.controller.deleteHero.bind(this.controller)));
    }
    getRouter() {
        return this.router;
    }
}
exports.HeroRoutes = HeroRoutes;
