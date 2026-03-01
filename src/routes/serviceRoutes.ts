import { Router } from "express";
import { ServicesController } from "../controllers/servicesController";
import { requireAuthv2, requireRole } from "../middlewares/auth";

export class serviceRoutes {
  private router: Router;

  constructor(private controller: ServicesController) {
    this.router = Router();
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.get("/", this.controller.getAllServices.bind(this.controller));
    this.router.get(
      "/check-order",
      requireAuthv2,
      this.controller.isValidOrder.bind(this.controller),
    );
    this.router.get(
      "/search",
      requireAuthv2,
      this.controller.SearchServices.bind(this.controller),
    );

    this.router.post(
      "/",
      requireAuthv2,
      requireRole(["ADMIN", "EDITOR"]),
      this.controller.createService.bind(this.controller),
    );

    this.router.get(
      "/slug/:slug",
      this.controller.getServiceBySlug.bind(this.controller),
    );
    this.router.delete(
      "/:id",
      requireAuthv2,
      requireRole(["ADMIN"]),
      this.controller.deleteService.bind(this.controller),
    );
    this.router.put(
      "/:id",
      requireAuthv2,
      requireRole(["ADMIN", "EDITOR"]),
      this.controller.updateService.bind(this.controller),
    );
    this.router.get(
      "/:id",
      this.controller.getServiceById.bind(this.controller),
    );
  }
  getRouter(): Router {
    return this.router;
  }
}
