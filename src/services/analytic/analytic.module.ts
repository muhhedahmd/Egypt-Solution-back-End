import { Router } from "express";
import { PrismaClientConfig } from "../../config/prisma";
import { AnalyticsRepository } from "./analytic.reposetory";
import { AnalyticsRoutes } from "../../routes/analyticRoutes";
import { AnalyticsController } from "../../controllers/analyticController";
import { AnalyticsService } from "./analytic.logic";


export class AnalyticModule {
  private repository: AnalyticsRepository;
//   private validator: AnalyticValidator;
  private AnalyticLogic: AnalyticsService;
  private routes: AnalyticsRoutes;
  private controller: AnalyticsController;
  constructor(prisma: PrismaClientConfig) {
    this.repository = new AnalyticsRepository(prisma);
    // this.validator = new AnalyticValidator();
    this.AnalyticLogic = new AnalyticsService(this.repository);
    this.controller = new AnalyticsController(this.AnalyticLogic);
    this.routes = new AnalyticsRoutes(this.controller);
  }
  getRoutes(): Router {
    return this.routes.getRouter();
  }
}
