import { Router } from "express";
// import { ClientController } from "../controllers/clientController";
import { companyInfoController } from "../controllers/settingsController";
import { requireAuthv2, requireRole } from "../middlewares/auth";

// const multer = multer
export class companyInfoRoutes {
  private router: Router;
  private controller: companyInfoController;

  constructor(controller: companyInfoController) {
    this.router = Router();
    this.controller = controller;
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/", this.controller.getSettings.bind(this.controller));
    this.router.get(
      "/achivements",
      this.controller.getMimalStats.bind(this.controller),
    );
    this.router.post(
      "/",
      requireAuthv2,
      requireRole(["ADMIN"]),

      this.controller.createSettings.bind(this.controller),
    );

    this.router.post(
      "/switch-lang",
      requireAuthv2,
      requireRole(["ADMIN"]),

      this.controller.SwitchLang.bind(this.controller),
    );

    this.router.get(
      "/current-lang",
      requireAuthv2,

      this.controller.currentLang.bind(this.controller),
    );

    this.router.put(
      "/:id",
      requireAuthv2,
      requireRole(["ADMIN"]),

      this.controller.updateSettings.bind(this.controller),
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
