import { Router } from "express";
import { ClientController } from "../controllers/clientController";
import { ContactController } from "../controllers/contactController";

// const upload = multer({ storage: multer.memoryStorage() });

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

    this.router.get("/", asyncHandler(this.controller.getPagnittedContacts.bind(this.controller)));
    this.router.post("/", asyncHandler(this.controller.cerateContact.bind(this.controller)));
    this.router.get("/:id", asyncHandler(this.controller.getContactById.bind(this.controller)));
    this.router.post("/search", asyncHandler(this.controller.searchContacts.bind(this.controller)));
    // this.router.put("/:id", asyncHandler(this.controller.updateContact.bind(this.controller)));
    // this.router.delete("/:id", asyncHandler(this.controller.deleteContact.bind(this.controller)));
    this.router.post("/filter", asyncHandler(this.controller.multiFilter.bind(this.controller)));

    


  }

  getRouter(): Router {
    return this.router;
  }
}
