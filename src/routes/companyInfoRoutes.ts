import { Router } from "express";
import { ClientController } from "../controllers/clientController";
import { companyInfoController } from "../controllers/settingsController";
import { requireAuthv2 } from "../middlewares/auth";
import multer from "multer";


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
    
    const asyncHandler = (fn: any) => (req: any, res: any, next: any) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
// asyncHandler(requireAuthv2)
//  asyncHandler(requireAuthv2),
    this.router.get("/" ,  asyncHandler(this.controller.getSettings.bind(this.controller)));
    this.router.get("/achivements",  asyncHandler(this.controller.getMimalStats.bind(this.controller)));
    this.router.post("/", asyncHandler(requireAuthv2),  asyncHandler(this.controller.createSettings.bind(this.controller)));
    this.router.put("/:id", asyncHandler(requireAuthv2) ,  asyncHandler(this.controller.updateSettings.bind(this.controller)));


  }

  getRouter(): Router {
    return this.router;
  }
}
