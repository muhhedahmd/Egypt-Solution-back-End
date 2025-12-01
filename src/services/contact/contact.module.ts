import { Router } from "express";
import { ContactController } from "../../controllers/contactController";
import { ContactValidator } from "../../errors/schema/contact.validation.schema";
import { ContactLogic } from "./contact.logic";
import { ContactRepostery } from "./contact.repostery";
import { PrismaClientConfig } from "../../config/prisma";
import { ContactRoutes } from "../../routes/ContactRoutes";


export class contactModule {
  private repository: ContactRepostery;
  private validator: ContactValidator;
  private logic: ContactLogic;
  private routes: ContactRoutes;
  private controller: ContactController;

  constructor(prisma: PrismaClientConfig) {
    this.repository = new ContactRepostery(prisma);
    this.validator = new ContactValidator();
    this.logic = new ContactLogic(this.repository, this.validator);
    this.controller = new ContactController(this.logic);
    this.routes = new ContactRoutes(this.controller);
  }

  getRoutes(): Router {
    return this.routes.getRouter();
  }
}