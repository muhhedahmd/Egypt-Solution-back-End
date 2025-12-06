
import { Router } from 'express';
import { HeroController } from '../controllers/heroController';

export class HeroRoutes {
  private router: Router;
  private controller: HeroController;

  constructor(controller: HeroController) {
    this.router = Router();
    this.controller = controller;
    this.initializeRoutes();
  }

  private initializeRoutes() {
    const asyncHandler = (fn: any) => (req: any, res: any, next: any) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };

    // GET routes
    this.router.get(
      '/',
      asyncHandler(this.controller.getAllHeroes.bind(this.controller))
    );

    this.router.get(
      '/active',
      asyncHandler(this.controller.getActiveHero.bind(this.controller))
    );

    this.router.get(
      '/search',
      asyncHandler(this.controller.SearchHeroes.bind(this.controller))
    );

    this.router.get(
      '/:id',
      asyncHandler(this.controller.getHeroById.bind(this.controller))
    );

    // POST routes
    this.router.post(
      '/',
      // upload.any(), // Uncomment when multer is configured
      asyncHandler(this.controller.createHero.bind(this.controller))
    );

    // PUT routes
    this.router.put(
      '/:id',
      // upload.any(), // Uncomment when multer is configured
      asyncHandler(this.controller.updateHero.bind(this.controller))
    );

    // DELETE routes
    this.router.delete(
      '/:id',
      asyncHandler(this.controller.deleteHero.bind(this.controller))
    );
  }

  getRouter(): Router {
    return this.router;
  }
}