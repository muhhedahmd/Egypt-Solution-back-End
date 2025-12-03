"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyInfoModule = void 0;
const settingsController_1 = require("../../controllers/settingsController");
const SettingsRepostery_1 = require("./SettingsRepostery");
const settingsLogic_1 = require("./settingsLogic");
const companyInfoRoutes_1 = require("../../routes/companyInfoRoutes");
class CompanyInfoModule {
    constructor(prisma) {
        this.repository = new SettingsRepostery_1.CompanyInfoRepostery(prisma);
        // this.validator = new CompanyInfoValidator();
        this.logic = new settingsLogic_1.CompanyInfoLogic(this.repository);
        this.controller = new settingsController_1.companyInfoController(this.logic);
        this.routes = new companyInfoRoutes_1.companyInfoRoutes(this.controller);
    }
    getRoutes() {
        return this.routes.getRouter();
    }
}
exports.CompanyInfoModule = CompanyInfoModule;
