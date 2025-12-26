


import { Router } from "express";
import { AnalyticsController } from "../controllers/analyticController";
import { validate } from "../middlewares/analyticMiddleWare";
import { getAnalyticsSchema, getTopPagesSchema, trackPageViewSchema } from "../errors/analytic.error";

export class AnalyticsRoutes {
  private router: Router;

  constructor(private controller: AnalyticsController) {
    this.router = Router();
    this.initializeRoutes();
  }
  private initializeRoutes() {
    const asyncHandler = (fn: any) => (req: any, res: any, next: any) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };

    this.router.post(
      "/track",
      validate(trackPageViewSchema),
      asyncHandler(this.controller.trackPageView)
    );

    this.router.post("/convert", asyncHandler(this.controller.markConverted));

    this.router.get(
      "/overview",
      validate(getAnalyticsSchema),
      asyncHandler(this.controller.getOverview)
    );

    this.router.get(
      "/top-pages",
      validate(getTopPagesSchema),
      asyncHandler(this.controller.getTopPages)
    );

    this.router.get(
      "/traffic-sources",
      validate(getAnalyticsSchema),
      asyncHandler(this.controller.getTrafficSources)
    );
  }
  getRouter(): Router {
    return this.router;
  }
}
