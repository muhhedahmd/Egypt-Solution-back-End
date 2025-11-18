import { Router } from 'express';
import { PrismaClientConfig } from '../../config/prisma';
import { TestimonialRepository } from './testimonial.repostery';
import { TestimonialValidator } from '../../errors/schema/testimonal.validation.schema';
import { TestimonialLogic } from './testimonial.logic';
import { TestimonialController } from '../../controllers/testimonialController';
import { TestimonialRoutes } from '../../routes/testimonialRoutes';

export class TestimonialModule {
  private repository: TestimonialRepository;
  private validator: TestimonialValidator;
  private logic: TestimonialLogic;
  private routes: TestimonialRoutes;
  private controller: TestimonialController;

  constructor(prisma: PrismaClientConfig) {
    this.repository = new TestimonialRepository(prisma);
    this.validator = new TestimonialValidator();
    this.logic = new TestimonialLogic(this.repository, this.validator);
    this.controller = new TestimonialController(this.logic);
    this.routes = new TestimonialRoutes(this.controller);
  }

  getRoutes(): Router {
    return this.routes.getRouter();
  }
}