import { Router } from "express";
import { slideShowController } from "../controllers/slideShowController";
import { requireAuth, requireAuthv2 } from "../middlewares/auth";

export class slideShowRoutes {
  private router: Router;
  constructor(private controller: slideShowController) {
    this.router = Router();
    this.initializeRoutes();
  }
  initializeRoutes() {
    const asyncHandler = (fn: any) => (req: any, res: any, next: any) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
    
    this.router.post(
        "/get-paginated-slides/:id",
        asyncHandler(this.controller.getPaginatedSlides.bind(this.controller))
    );
    this.router.get(
      "/",
      asyncHandler(this.controller.getAllSlideShows.bind(this.controller))
    );
    this.router.get(
      "/all-minimal",
      asyncHandler(this.controller.getAllSlideShows.bind(this.controller))
    );
    // *** & ####

    this.router.post(
  "/bulk-operations/:id",
  asyncHandler(requireAuthv2),
  asyncHandler(this.controller.bulkSlideOperations.bind(this.controller))
);
    // ***
    this.router.post(
      "/create-attach-many",
      asyncHandler(requireAuthv2),
      asyncHandler(this.controller.CreateAndAttachMany.bind(this.controller))
    );
    // ***
    this.router.post(
      "/update-attach-many",
      asyncHandler(requireAuthv2),
      asyncHandler(this.controller.UpdateAndAttachMany.bind(this.controller))
    );
    
    this.router.post(
      "/",
      asyncHandler(requireAuthv2),
      asyncHandler(this.controller.createSlideShow.bind(this.controller))
    );
   
    this.router.post(
      "/attach-many",
      asyncHandler(requireAuthv2),
      asyncHandler(this.controller.attachMany.bind(this.controller))
    );
    this.router.get(
      "/grouped-type/:id",
      asyncHandler(requireAuthv2),
      asyncHandler(this.controller.getAttachedsGrouped.bind(this.controller))
    );
    this.router.get(
      "/by-type",
      asyncHandler(this.controller.getSlideShowsByType.bind(this.controller))
    );
    this.router.get(
      "/attaches-by-type/:id",
      asyncHandler(this.controller.getAttachesByType.bind(this.controller))
    );
    this.router.delete(
      "/detach-many",
      asyncHandler(requireAuthv2),
      asyncHandler(this.controller.deAttachMany.bind(this.controller))
    );
     this.router.put(
      "/reorder-bulk",
      asyncHandler(requireAuthv2),
      asyncHandler(this.controller.reorderBulkSlideShow.bind(this.controller))
    );
     this.router.get(
      "/:id",
      asyncHandler(this.controller.getSlideShowById.bind(this.controller))
    );

    this.router.delete(
        "/:id",
        asyncHandler(requireAuthv2),
        asyncHandler(this.controller.deleteSlideShow.bind(this.controller))
    );
    this.router.put(
      "/:id",
      asyncHandler(requireAuthv2),
      asyncHandler(this.controller.updateSlideShow.bind(this.controller))
    );

    // reorderBulkSlideShow 
   
  }
  getRoutes(): Router {
    return this.router;
  }
}
