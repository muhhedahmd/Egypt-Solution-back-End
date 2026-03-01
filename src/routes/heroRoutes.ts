import { Router } from "express";
import { HeroController } from "../controllers/heroController";
import { requireAuthv2, requireRole } from "../middlewares/auth";

export class HeroRoutes {
  private router: Router;
  private controller: HeroController;

  constructor(controller: HeroController) {
    this.router = Router();
    this.controller = controller;
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // GET routes
    this.router.get(
      "/",
      // requireAuthv2,
      this.controller.getAllHeroes.bind(this.controller),
    );

    this.router.get(
      "/active",
      this.controller.getActiveHero.bind(this.controller),
    );

    this.router.get(
      "/search",
      requireAuthv2,
      this.controller.SearchHeroes.bind(this.controller),
    );

    this.router.put(
      "/toggle-active/:id",
      requireAuthv2,
      requireRole(["ADMIN"]),
      this.controller.ToggleActive.bind(this.controller),
    );
    this.router.get(
      "/:id",
      requireAuthv2,

      this.controller.getHeroById.bind(this.controller),
    );

    // POST routes
    this.router.post(
      "/",
      requireAuthv2,
      requireRole(["ADMIN", "EDITOR"]),
      this.controller.createHero.bind(this.controller),
    );

    // PUT routes
    this.router.put(
      "/:id",
      requireAuthv2,
      requireRole(["ADMIN", "EDITOR"]),
      this.controller.updateHero.bind(this.controller),
    );

    // DELETE routes
    this.router.delete(
      "/:id",
      requireAuthv2,
      requireRole(["ADMIN"]),
      this.controller.deleteHero.bind(this.controller),
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
