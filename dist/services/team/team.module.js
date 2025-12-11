"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamModule = void 0;
const team_validation_schema_1 = require("../../errors/schema/team.validation.schema");
const team_logic_1 = require("./team.logic");
const team_repository_1 = require("./team.repository");
const teamController_1 = require("../../controllers/teamController");
const teamRoutes_1 = require("../../routes/teamRoutes");
class TeamModule {
    constructor(prisma) {
        this.repository = new team_repository_1.TeamRepository(prisma);
        this.validator = new team_validation_schema_1.TeamValidator();
        this.logic = new team_logic_1.TeamLogic(this.repository, this.validator);
        this.controller = new teamController_1.TeamController(this.logic);
        this.routes = new teamRoutes_1.teamRoutes(this.controller);
    }
    getRoutes() {
        return this.routes.getRouter();
    }
}
exports.TeamModule = TeamModule;
