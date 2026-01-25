import { Router } from "express";
import { slideShowController } from "../controllers/slideShowController";
import { requireAuthv2 } from "../middlewares/auth";
export class slideShowRoutes {
  private router: Router;
  constructor(private controller: slideShowController) {
    this.router = Router();
    this.initializeRoutes();
  }
  initializeRoutes() {
    this.router.post(
      "/get-paginated-slides/:id",

      this.controller.getPaginatedSlides.bind(this.controller),
    );

    // 💀💀💀💀  30s res
    // this.router.post(
    //     "/with-slides",
    // requireAuthv2,
    //
    //     this.controller.getSlideShowWithSlides.bind(this.controller)
    //

    this.router.get(
      "/",
      this.controller.getAllSlideShows.bind(this.controller),
    );
    this.router.get(
      "/all-minimal",
      requireAuthv2,

      this.controller.getAllSlideShowsMinmal.bind(this.controller),
    );
    // *** & ####

    this.router.post(
      "/bulk-operations/:id",
      requireAuthv2,
      this.controller.bulkSlideOperations.bind(this.controller),
    );
    // ***
    this.router.post(
      "/create-attach-many",
      requireAuthv2,
      this.controller.CreateAndAttachMany.bind(this.controller),
    );
    // ***
    this.router.post(
      "/update-attach-many",
      requireAuthv2,
      this.controller.UpdateAndAttachMany.bind(this.controller),
    );

    this.router.post(
      "/",
      requireAuthv2,
      this.controller.createSlideShow.bind(this.controller),
    );

    this.router.post(
      "/attach-many",
      requireAuthv2,
      this.controller.attachMany.bind(this.controller),
    );
    this.router.get(
      "/grouped-type/:id",
      requireAuthv2,
      this.controller.getAttachedsGrouped.bind(this.controller),
    );
    this.router.get(
      "/by-type",
      requireAuthv2,

      this.controller.getSlideShowsByType.bind(this.controller),
    );
    this.router.get(
      "/attaches-by-type/:id",
      requireAuthv2,

      this.controller.getAttachesByType.bind(this.controller),
    );
    this.router.delete(
      "/detach-many",
      requireAuthv2,
      this.controller.deAttachMany.bind(this.controller),
    );
    this.router.put(
      "/reorder-bulk",
      requireAuthv2,
      this.controller.reorderBulkSlideShow.bind(this.controller),
    );
    this.router.get(
      "/:id",
      this.controller.getSlideShowById.bind(this.controller),
    );

    this.router.delete(
      "/:id",
      requireAuthv2,

      this.controller.deleteSlideShow.bind(this.controller),
    );
    this.router.put(
      "/:id",
      requireAuthv2,
      this.controller.updateSlideShow.bind(this.controller),
    );

    // reorderBulkSlideShow
  }
  getRoutes(): Router {
    return this.router;
  }
}
