"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientModule = void 0;
const client_validation_schema_1 = require("../../errors/schema/client.validation.schema");
const client_logic_1 = require("./client.logic");
const client_repository_1 = require("./client.repository");
const clientController_1 = require("../../controllers/clientController");
const clientRoutes_1 = require("../../routes/clientRoutes");
class ClientModule {
    constructor(prisma) {
        this.repository = new client_repository_1.ClientRepository(prisma);
        this.validator = new client_validation_schema_1.ClientValidator();
        this.logic = new client_logic_1.ClientLogic(this.repository, this.validator);
        this.controller = new clientController_1.ClientController(this.logic);
        this.routes = new clientRoutes_1.ClientRoutes(this.controller);
    }
    getRoutes() {
        return this.routes.getRouter();
    }
}
exports.ClientModule = ClientModule;
