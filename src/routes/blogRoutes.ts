import { Router } from "express";
import { blogController } from "../controllers/blogController";

export class blogRoutes {
  private router: Router;

  constructor(private controller: blogController) {
    this.router = Router();
    this.initializeRoutes();
  }

  initializeRoutes() {


 
    // Get all blogs
  //  
  }

  getRoutes(): Router {
    return this.router;
  }
}