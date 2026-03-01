import { Router } from "express";
import { TeamController } from "../controllers/teamController";
import { requireAuthv2, requireRole } from "../middlewares/auth";

// const upload = multer({ storage: multer.memoryStorage() });

export class teamRoutes {
  private router: Router;
  private controller: TeamController;

  constructor(controller: TeamController) {
    this.router = Router();
    this.controller = controller;
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      "/",
      this.controller.getAllTeamMembers.bind(this.controller),
    );
    this.router.get(
      "/active",
      this.controller.getAllTeamMembersActive.bind(this.controller),
    );

    this.router.get(
      "/search",
      requireAuthv2,

      this.controller.SearchTeamMembers.bind(this.controller),
    );

    this.router.get(
      "/check-order",
      requireAuthv2,

      this.controller.isValidOrder.bind(this.controller),
    );

    this.router.get(
      "/:id",
      requireAuthv2,

      this.controller.getTeamMemberById.bind(this.controller),
    );

    this.router.get(
      "/slug/:slug",
      requireAuthv2,

      this.controller.getTeamMemberBySlug.bind(this.controller),
    );

    // POST routes
    this.router.post(
      "/",
      requireAuthv2,
      requireRole(["ADMIN", "EDITOR"]),
      //   upload.any(),
      this.controller.createTeamMember.bind(this.controller),
    );

    // PUT routes
    this.router.put(
      "/:id",
      requireAuthv2,
      requireRole(["ADMIN", "EDITOR"]),
      this.controller.updateTeamMember.bind(this.controller),
    );

    // DELETE routes
    this.router.delete(
      "/:id",
      requireAuthv2,
      requireRole(["ADMIN"]),
      this.controller.deleteTeamMember.bind(this.controller),
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
