import { Router } from "express";
import { ClientController } from "../controllers/clientController";
import multer from "multer";
import { TeamController } from "../controllers/teamController";

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
    const asyncHandler = (fn: any) => (req: any, res: any, next: any) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };

    this.router.get("/", asyncHandler(this.controller.getAllTeamMembers.bind(this.controller)));
    this.router.get("/active", asyncHandler(this.controller.getAllTeamMembersActive.bind(this.controller)));

    this.router.get(
      "/search",
      asyncHandler(this.controller.SearchTeamMembers.bind(this.controller))
    );

    this.router.get(
      "/check-order",
      asyncHandler(this.controller.isValidOrder.bind(this.controller))
    );

    this.router.get(
      "/:id",
      asyncHandler(this.controller.getTeamMemberById.bind(this.controller))
    );

    this.router.get(
      "/slug/:slug",
      asyncHandler(this.controller.getTeamMemberBySlug.bind(this.controller))
    );

    // POST routes
    this.router.post(
      "/",
    //   upload.any(),
      asyncHandler(this.controller.createTeamMember.bind(this.controller))
    );

    // PUT routes
    this.router.put(
      "/:id",
     
      asyncHandler(this.controller.updateTeamMember.bind(this.controller))
    );

    // DELETE routes
    this.router.delete(
      "/:id",
      asyncHandler(this.controller.deleteTeamMember.bind(this.controller))
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
