import { Router } from "express";
import { TestimonialController } from "../controllers/testimonialController";
import { requireAuthv2, requireRole } from "../middlewares/auth";

export class TestimonialRoutes {
  private router: Router;
  private controller: TestimonialController;

  constructor(controller: TestimonialController) {
    this.router = Router();
    this.controller = controller;
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // GET routes
    this.router.get(
      "/",
      this.controller.getAllTestimonials.bind(this.controller),
    );

    this.router.get(
      "/search",
      // requireAuthv2,
      this.controller.SearchTestimonials.bind(this.controller),
    );

    this.router.get(
      "/check-order",
      // requireAuthv2,
      this.controller.isValidOrder.bind(this.controller),
    );

    this.router.get(
      "/:id",
      // requireAuthv2,
      this.controller.getTestimonialById.bind(this.controller),
    );

    // POST routes
    this.router.post(
      "/",
      requireAuthv2,
      requireRole(["ADMIN", "EDITOR"]),
      this.controller.createTestimonial.bind(this.controller),
    );

    // PUT routes
    this.router.put(
      "/:id",
      requireAuthv2,
      requireRole(["ADMIN", "EDITOR"]),
      this.controller.updateTestimonial.bind(this.controller),
    );

    // DELETE routes
    this.router.delete(
      "/:id",
      requireAuthv2,
      requireRole(["ADMIN"]),
      this.controller.deleteTestimonial.bind(this.controller),
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
