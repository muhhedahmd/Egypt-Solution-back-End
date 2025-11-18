import { Router } from 'express';
import { PrismaClientConfig } from '../../config/prisma';
import { TeamValidator } from '../../errors/schema/team.validation.schema';
import { TeamLogic } from './team.logic';
import { TeamRepository } from './team.repository';
import { TeamController } from '../../controllers/teamController';
import { teamRoutes } from '../../routes/teamRoutes';

export class TeamModule {
  private repository: TeamRepository;
  private validator: TeamValidator;
  private logic: TeamLogic;
  private routes: teamRoutes;
  private controller: TeamController;

  constructor(prisma: PrismaClientConfig) {
    this.repository = new TeamRepository(prisma);
    this.validator = new TeamValidator();
    this.logic = new TeamLogic(this.repository, this.validator);
    this.controller = new TeamController(this.logic);
    this.routes = new teamRoutes(this.controller);
  }

  getRoutes(): Router {
    return this.routes.getRouter();
  }
}