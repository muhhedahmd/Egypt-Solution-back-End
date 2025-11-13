import { Router } from "express";
import { ClientController } from "../controllers/clientController";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

export class ClientRoutes {
  private router: Router;
  private controller: ClientController;

  constructor(controller: ClientController) {
    this.router = Router();
    this.controller = controller;
    this.initializeRoutes();
  }

  private initializeRoutes() {
    const asyncHandler = (fn: any) => (req: any, res: any, next: any) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
    // GET routes
    this.router.get("/", asyncHandler(this.controller.getAllClients.bind(this.controller)));

    this.router.get(
      "/search",
      asyncHandler(this.controller.SearchClients.bind(this.controller))
    );

    this.router.get(
      "/check-order",
      asyncHandler(this.controller.isValidOrder.bind(this.controller))
    );

    this.router.get(
      "/:id",
      asyncHandler(this.controller.getClientById.bind(this.controller))
    );

    this.router.get(
      "/slug/:slug",
      asyncHandler(this.controller.getClientBySlug.bind(this.controller))
    );

    // POST routes
    this.router.post(
      "/",
      upload.fields([
        { name: "image", maxCount: 1 },
        { name: "logo", maxCount: 1 },
      ]),
      asyncHandler(this.controller.createClient.bind(this.controller))
    );

    // PUT routes
    this.router.put(
      "/:id",
      upload.fields([
        { name: "image", maxCount: 1 },
        { name: "logo", maxCount: 1 },
      ]),
      asyncHandler(this.controller.updateClient.bind(this.controller))
    );

    // DELETE routes
    this.router.delete(
      "/:id",
      asyncHandler(this.controller.deleteClient.bind(this.controller))
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
