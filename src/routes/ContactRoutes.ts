import { Router } from "express";
import { ContactController } from "../controllers/contactController";
import { requireAuthv2, requireRole } from "../middlewares/auth";

export class ContactRoutes {
  private router: Router;
  private controller: ContactController;

  constructor(controller: ContactController) {
    this.router = Router();
    this.controller = controller;
    this.initializeRoutes();
  }

  private initializeRoutes() {
    const asyncHandler = (fn: any) => (req: any, res: any, next: any) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };

    this.router.get(
      "/",
      asyncHandler(requireAuthv2),
      asyncHandler(this.controller.getPagnittedContacts.bind(this.controller)),
    );
    this.router.post(
      "/",
      asyncHandler(this.controller.cerateContact.bind(this.controller)),
    );
    this.router.get(
      "/stats",
      asyncHandler(requireAuthv2),
      asyncHandler(requireRole(["ADMIN"])),
      asyncHandler(this.controller.getStats.bind(this.controller)),
    );
    this.router.get(
      "/search",
      asyncHandler(requireAuthv2),
      asyncHandler(requireRole(["ADMIN"])),
      asyncHandler(this.controller.searchContacts.bind(this.controller)),
    );
    this.router.post(
      "/replay/:id",
      asyncHandler(requireAuthv2),
      asyncHandler(requireRole(["ADMIN"])),
      asyncHandler(this.controller.replay.bind(this.controller)),
    );
    this.router.put(
      "/:id",
      asyncHandler(requireAuthv2),
      asyncHandler(requireRole(["ADMIN", "EDITOR"])),
      asyncHandler(this.controller.update.bind(this.controller)),
    );
    // this.router.delete("/:id", asyncHandler(this.controlle.bind(this.controller)));
    this.router.post(
      "/filter",
      asyncHandler(requireAuthv2),
      asyncHandler(requireRole(["ADMIN"])),
      asyncHandler(this.controller.multiFilter.bind(this.controller)),
    );
    this.router.get(
      "/:id",
      asyncHandler(requireAuthv2),
      asyncHandler(requireRole(["ADMIN"])),
      asyncHandler(this.controller.getContactById.bind(this.controller)),
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
