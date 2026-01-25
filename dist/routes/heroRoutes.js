"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeroRoutes = void 0;
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
class HeroRoutes {
    constructor(controller) {
        this.router = (0, express_1.Router)();
        this.controller = controller;
        this.initializeRoutes();
    }
    initializeRoutes() {
        // GET routes
        this.router.get('/', 
        // requireAuthv2,
        this.controller.getAllHeroes.bind(this.controller));
        this.router.get('/active', this.controller.getActiveHero.bind(this.controller));
        this.router.get('/search', auth_1.requireAuthv2, this.controller.SearchHeroes.bind(this.controller));
        this.router.put('/toggle-active/:id', auth_1.requireAuthv2, this.controller.ToggleActive.bind(this.controller));
        this.router.get('/:id', auth_1.requireAuthv2, this.controller.getHeroById.bind(this.controller));
        // POST routes
        this.router.post('/', auth_1.requireAuthv2, this.controller.createHero.bind(this.controller));
        // PUT routes
        this.router.put('/:id', auth_1.requireAuthv2, this.controller.updateHero.bind(this.controller));
        // DELETE routes
        this.router.delete('/:id', auth_1.requireAuthv2, this.controller.deleteHero.bind(this.controller));
    }
    getRouter() {
        return this.router;
    }
}
exports.HeroRoutes = HeroRoutes;
