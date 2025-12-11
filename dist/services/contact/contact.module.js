"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactModule = void 0;
const contactController_1 = require("../../controllers/contactController");
const contact_validation_schema_1 = require("../../errors/schema/contact.validation.schema");
const contact_logic_1 = require("./contact.logic");
const contact_repostery_1 = require("./contact.repostery");
const ContactRoutes_1 = require("../../routes/ContactRoutes");
class contactModule {
    constructor(prisma) {
        this.repository = new contact_repostery_1.ContactRepostery(prisma);
        this.validator = new contact_validation_schema_1.ContactValidator();
        this.logic = new contact_logic_1.ContactLogic(this.repository, this.validator);
        this.controller = new contactController_1.ContactController(this.logic);
        this.routes = new ContactRoutes_1.ContactRoutes(this.controller);
    }
    getRoutes() {
        return this.routes.getRouter();
    }
}
exports.contactModule = contactModule;
