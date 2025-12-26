"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsRoutes = void 0;
const express_1 = require("express");
const analyticMiddleWare_1 = require("../middlewares/analyticMiddleWare");
const analytic_error_1 = require("../errors/analytic.error");
class AnalyticsRoutes {
    constructor(controller) {
        this.controller = controller;
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        const asyncHandler = (fn) => (req, res, next) => {
            Promise.resolve(fn(req, res, next)).catch(next);
        };
        this.router.post("/track", (0, analyticMiddleWare_1.validate)(analytic_error_1.trackPageViewSchema), asyncHandler(this.controller.trackPageView));
        this.router.post("/convert", asyncHandler(this.controller.markConverted));
        this.router.get("/overview", (0, analyticMiddleWare_1.validate)(analytic_error_1.getAnalyticsSchema), asyncHandler(this.controller.getOverview));
        this.router.get("/top-pages", (0, analyticMiddleWare_1.validate)(analytic_error_1.getTopPagesSchema), asyncHandler(this.controller.getTopPages));
        this.router.get("/traffic-sources", (0, analyticMiddleWare_1.validate)(analytic_error_1.getAnalyticsSchema), asyncHandler(this.controller.getTrafficSources));
    }
    getRouter() {
        return this.router;
    }
}
exports.AnalyticsRoutes = AnalyticsRoutes;
