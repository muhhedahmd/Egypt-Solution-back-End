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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamLogic = void 0;
const slugify_1 = __importDefault(require("slugify"));
const crypto_1 = require("crypto");
const team_error_1 = require("../../errors/team.error");
class TeamLogic {
    constructor(repository, validator) {
        this.repository = repository;
        this.validator = validator;
    }
    isValidOrder(_a) {
        return __awaiter(this, arguments, void 0, function* ({ order }) {
            const isValid = yield this.repository.isValidOrder({ order });
            return isValid;
        });
    }
    getAllTeamMembers(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const skip = params.skip || 0;
            const take = params.take || 10;
            const [teamMembers, totalItems] = yield Promise.all([
                this.repository.findMany(skip, take),
                this.repository.count(),
            ]);
            const remainingItems = totalItems - (skip * take + teamMembers.length);
            return {
                data: teamMembers,
                pagination: {
                    totalItems,
                    remainingItems,
                    nowCount: teamMembers.length,
                    totalPages: Math.ceil(totalItems / take),
                    currentPage: skip + 1,
                    pageSize: take,
                },
            };
        });
    }
    getTeamMemberById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            this.validator.validateId(id);
            const teamMember = yield this.repository.findById(id);
            if (!teamMember) {
                throw new team_error_1.TeamNotFoundError(id);
            }
            const { image } = teamMember, rest = __rest(teamMember, ["image"]);
            return {
                Image: image,
                teamMember: rest,
            };
        });
    }
    getTeamMemberBySlug(slug) {
        return __awaiter(this, void 0, void 0, function* () {
            this.validator.validateSlug(slug);
            const teamMember = yield this.repository.findBySlug(slug);
            if (!teamMember) {
                throw new team_error_1.TeamError(`team member with slug not found ${slug}`, 404, 'TEAM_NOT_FOUND');
            }
            return teamMember;
        });
    }
    createTeamMember(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const valid = this.validator.validateCreate(data);
            const slug = (0, slugify_1.default)(data.name + (0, crypto_1.randomUUID)().substring(0, 8), {
                lower: true,
            });
            const teamMember = yield this.repository.create(Object.assign(Object.assign({}, valid), { slug: slug }));
            if (!teamMember)
                throw new Error('error create team member');
            return teamMember;
        });
    }
    deleteTeamMember(teamId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!teamId)
                    throw new Error('id is required');
                this.validator.validateId(teamId);
                const deletedTeamMember = yield this.repository.delete(teamId);
                if (!deletedTeamMember)
                    throw new Error('error deleting team member');
                return deletedTeamMember;
            }
            catch (error) {
                console.error(error);
                throw new Error('Error deleting team member');
            }
        });
    }
    Search(q) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!q)
                throw new team_error_1.TeamError('search query is required', 400, 'SEARCH_QUERY_REQUIRED');
            const teamMembers = yield this.repository.SearchTeamMember(q, 0, 10);
            if (!teamMembers)
                throw new team_error_1.TeamError('error searching team members', 400, 'ERROR_SEARCHING_TEAM_MEMBERS');
            return teamMembers;
        });
    }
    updateTeamMember(data) {
        return __awaiter(this, void 0, void 0, function* () {
            this.validator.validateUpdate(data);
            const updatedTeamMember = yield this.repository.update(data);
            if (!updatedTeamMember)
                throw new team_error_1.TeamError('error updating team member', 400, 'ERROR_UPDATING_TEAM_MEMBER');
            const { Image } = updatedTeamMember, rest = __rest(updatedTeamMember, ["Image"]);
            return Object.assign({ Image }, rest);
        });
    }
}
exports.TeamLogic = TeamLogic;
