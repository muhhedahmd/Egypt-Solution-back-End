import { Router } from 'express';
import { PrismaClientConfig } from '../../config/prisma';
import { ClientValidator } from '../../errors/schema/client.validation.schema';
import { ClientLogic } from './client.logic';
import { ClientRepository } from './client.repository';
import { ClientController } from '../../controllers/clientController';
import { ClientRoutes } from '../../routes/clientRoutes';

export class ClientModule {
  private repository: ClientRepository;
  private validator: ClientValidator;
  private logic: ClientLogic;
  private routes: ClientRoutes;
  private controller: ClientController;

  constructor(prisma: PrismaClientConfig) {
    this.repository = new ClientRepository(prisma);
    this.validator = new ClientValidator();
    this.logic = new ClientLogic(this.repository, this.validator);
    this.controller = new ClientController(this.logic);
    this.routes = new ClientRoutes(this.controller);
  }

  getRoutes(): Router {
    return this.routes.getRouter();
  }
}