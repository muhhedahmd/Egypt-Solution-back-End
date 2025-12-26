"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticModule = void 0;
const analytic_reposetory_1 = require("./analytic.reposetory");
const analyticRoutes_1 = require("../../routes/analyticRoutes");
const analyticController_1 = require("../../controllers/analyticController");
const analytic_logic_1 = require("./analytic.logic");
class AnalyticModule {
    constructor(prisma) {
        this.repository = new analytic_reposetory_1.AnalyticsRepository(prisma);
        // this.validator = new AnalyticValidator();
        this.AnalyticLogic = new analytic_logic_1.AnalyticsService(this.repository);
        this.controller = new analyticController_1.AnalyticsController(this.AnalyticLogic);
        this.routes = new analyticRoutes_1.AnalyticsRoutes(this.controller);
    }
    getRoutes() {
        return this.routes.getRouter();
    }
}
exports.AnalyticModule = AnalyticModule;
