import { Router } from 'express';
import { companyInfoController } from '../../controllers/settingsController';
import { PrismaClientConfig } from '../../config/prisma';
import { CompanyInfoRepostery } from './SettingsRepostery';
import { CompanyInfoLogic } from './settingsLogic';
import { companyInfoRoutes } from '../../routes/companyInfoRoutes';

export class CompanyInfoModule {
  private repository: CompanyInfoRepostery;
//   private validator: CompanyInfoValidator;
  private logic: CompanyInfoLogic;
  private routes: companyInfoRoutes;
  private controller: companyInfoController;

  constructor(prisma: PrismaClientConfig) {
    this.repository = new CompanyInfoRepostery(prisma);
    // this.validator = new CompanyInfoValidator();
    this.logic = new CompanyInfoLogic(this.repository,
        //  this.validator
        );
    this.controller = new companyInfoController(this.logic);
    this.routes = new companyInfoRoutes(this.controller);
  }

  getRoutes(): Router {
    return this.routes.getRouter();
  }
}