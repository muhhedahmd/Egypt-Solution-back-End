
import { Router } from 'express';
import { HeroRepository } from './hero.repostery';
import { HeroLogic } from './hero.logic';
import { HeroValidator } from '../../errors/schema/hero.validation.schema';
import { HeroController } from '../../controllers/heroController';
import { HeroRoutes } from '../../routes/heroRoutes';
import { PrismaClientConfig } from '../../config/prisma';

export class HeroModule {
  private repository: HeroRepository;
  private logic: HeroLogic;
  private validator: HeroValidator;
  private controller: HeroController;
  private routes: HeroRoutes;

  constructor(prisma: PrismaClientConfig) {
    this.repository = new HeroRepository(prisma);
    this.validator = new HeroValidator();
    this.logic = new HeroLogic(this.repository, this.validator);
    this.controller = new HeroController(this.logic);
    this.routes = new HeroRoutes(this.controller);
  }

  getRoutes(): Router {
    return this.routes.getRouter();
  }

  // getRepository(): HeroRepository {
  //   return this.repository;
  // }

  // getLogic(): HeroLogic {
  //   return this.logic;
  // }

  // getController(): HeroController {
  //   return this.controller;
  // }
}
