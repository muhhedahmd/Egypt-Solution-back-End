import { Router } from "express";
import { ServicesController } from "../controllers/servicesController";
import { requireAuthv2 } from "../middlewares/auth";


export class serviceRoutes {
    private router: Router;  

  constructor(private controller: ServicesController) {
    this.router = Router();
    this.initializeRoutes();
  }
  private initializeRoutes() {
      
    const asyncHandler = (fn: any) => (req: any, res: any, next: any) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
    
    this.router.get("/", asyncHandler(this.controller.getAllServices.bind(this.controller)));
    this.router.get("/check-order", asyncHandler(this.controller.isValidOrder.bind(this.controller)));
    this.router.get("/search", asyncHandler(this.controller.SearchServices.bind(this.controller)));
  
    this.router.post("/", asyncHandler(requireAuthv2)  ,  asyncHandler(this.controller.createService.bind(this.controller)));
    
    this.router.get("/slug/:slug", asyncHandler(this.controller.getServiceBySlug.bind(this.controller)));
    this.router.delete("/:id" ,asyncHandler(requireAuthv2) , asyncHandler(this.controller.deleteService.bind(this.controller)));
    this.router.put("/:id" , asyncHandler(requireAuthv2) , asyncHandler(this.controller.updateService.bind(this.controller)));
    this.router.get("/:id", asyncHandler(this.controller.getServiceById.bind(this.controller)));
  }
  getRouter(): Router {
    return this.router;
  }
}
