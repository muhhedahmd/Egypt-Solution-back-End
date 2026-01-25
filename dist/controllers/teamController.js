"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamController = void 0;
const team_error_1 = require("../errors/team.error");
class TeamController {
    constructor(teamLogic) {
        this.teamLogic = teamLogic;
    }
    getAllTeamMembers(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { skip, take } = req.query;
                const teamMembers = yield this.teamLogic.getAllTeamMembers({
                    skip: Number(skip) || 0,
                    take: Number(take) || 10,
                });
                if (!teamMembers)
                    throw new team_error_1.TeamNotFoundError("error get team members");
                return res.json(Object.assign(Object.assign({}, teamMembers), { message: "team members fetched successfully" }));
            }
            catch (error) {
                next(error);
            }
        });
    }
    getAllTeamMembersActive(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { skip, take, isFeatured } = req.query;
                const teamMembers = yield this.teamLogic.getAllTeamMembersActive({
                    skip: Number(skip) || 0,
                    take: Number(take) || 10,
                    isFeatured: isFeatured === "true",
                });
                if (!teamMembers)
                    throw new team_error_1.TeamNotFoundError("error get team members");
                return res.json(Object.assign(Object.assign({}, teamMembers), { message: "team members fetched successfully" }));
            }
            catch (error) {
                next(error);
            }
        });
    }
    getTeamMemberById(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                if (!id)
                    throw new team_error_1.TeamNotFoundError("id is required");
                const teamMember = yield this.teamLogic.getTeamMemberById(id);
                return res.json({
                    data: teamMember,
                    message: "team member fetched successfully",
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getTeamMemberBySlug(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { slug } = req.params;
                const teamMember = yield this.teamLogic.getTeamMemberBySlug(slug);
                return res.json({
                    data: teamMember,
                    message: "team member fetched successfully",
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    isValidOrder(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { order } = req.query;
                if (typeof Number(order) !== "number" || isNaN(Number(order)))
                    throw new team_error_1.TeamNotFoundError("order is not valid");
                const isValidOrder = yield this.teamLogic.isValidOrder({
                    order: Number(order),
                });
                return res.json({
                    data: {
                        isValid: isValidOrder.isValid,
                        takenBy: isValidOrder.takenby,
                    },
                    message: "checked order successfully",
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    createTeamMember(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const data = req.body;
                const lang = req.lang || "EN";
                const newTeamMember = yield this.teamLogic.createTeamMember(lang, Object.assign(Object.assign({}, data), { isActive: data.isActive === "true" ? true : false, isFeatured: data.isFeatured === "true" ? true : false, order: Number(data.order) || 0, image: Array.isArray(req.files) && req.files.length > 0
                        ? (_a = req.files.find((f) => f.fieldname === "image")) === null || _a === void 0 ? void 0 : _a.buffer
                        : null }));
                return res.status(201).json({
                    data: newTeamMember,
                    message: "team member created successfully",
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    updateTeamMember(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { id } = req.params;
                const teamData = req.body;
                const files = req.files;
                const lang = req.lang || "EN";
                const data = Object.assign(Object.assign({}, teamData), { teamId: id, image: Array.isArray(files) && files.length > 0
                        ? (_a = files.find((f) => f.fieldname === "image")) === null || _a === void 0 ? void 0 : _a.buffer
                        : undefined, imageState: teamData === null || teamData === void 0 ? void 0 : teamData.imageState });
                const updatedTeamMember = yield this.teamLogic.updateTeamMember(lang, Object.assign(Object.assign({}, data), { isActive: data.isActive === "true"
                        ? true
                        : data.isActive === "false"
                            ? false
                            : undefined, isFeatured: data.isFeatured === "true"
                        ? true
                        : data.isFeatured === "false"
                            ? false
                            : undefined, order: data.order ? Number(data.order) : undefined }));
                return res.json({
                    data: updatedTeamMember,
                    message: "team member updated successfully",
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    deleteTeamMember(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                if (!id)
                    throw new team_error_1.TeamNotFoundError("id is required");
                const deletedTeamMember = yield this.teamLogic.deleteTeamMember(id);
                if (!deletedTeamMember)
                    throw new team_error_1.TeamNotFoundError("error deleting team member");
                return res.json({
                    data: deletedTeamMember,
                    message: "team member deleted successfully",
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    SearchTeamMembers(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const lang = req.lang || "EN";
                const { q } = req.query;
                if (!q || typeof q !== "string")
                    throw new team_error_1.TeamError("search query is required", 400, "SEARCH_QUERY_REQUIRED");
                const teamMembers = yield this.teamLogic.Search(lang, q);
                if (!teamMembers)
                    throw new team_error_1.TeamNotFoundError("error searching team members");
                return res.json({
                    data: teamMembers,
                    message: "team members searched successfully",
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.TeamController = TeamController;
