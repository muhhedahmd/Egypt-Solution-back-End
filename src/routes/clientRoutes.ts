import { Router } from "express";
import { ClientController } from "../controllers/clientController";
import { requireAuthv2, requireRole } from "../middlewares/auth";

// const upload = multer({ storage: multer.memoryStorage() });

export class ClientRoutes {
  private router: Router;
  private controller: ClientController;

  constructor(controller: ClientController) {
    this.router = Router();
    this.controller = controller;
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/", this.controller.getAllClients.bind(this.controller));

    this.router.get(
      "/search",
      requireAuthv2,
      this.controller.SearchClients.bind(this.controller),
    );

    this.router.get(
      "/check-order",
      requireAuthv2,

      this.controller.isValidOrder.bind(this.controller),
    );

    this.router.get(
      "/:id",
      requireAuthv2,
      this.controller.getClientById.bind(this.controller),
    );

    this.router.get(
      "/slug/:slug",
      requireAuthv2,

      this.controller.getClientBySlug.bind(this.controller),
    );

    // POST routes
    this.router.post(
      "/",
      requireAuthv2,
      requireRole(["ADMIN", "EDITOR"]),
      this.controller.createClient.bind(this.controller),
    );

    // PUT routes
    this.router.put(
      "/:id",
      requireAuthv2,
      requireRole(["ADMIN", "EDITOR"]),
      this.controller.updateClient.bind(this.controller),
    );

    // DELETE routes
    this.router.delete(
      "/:id",
      requireAuthv2,
      requireRole(["ADMIN"]),
      this.controller.deleteClient.bind(this.controller),
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
