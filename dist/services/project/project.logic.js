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
exports.projectLogic = void 0;
const crypto_1 = require("crypto");
const slugify_1 = __importDefault(require("slugify"));
const services_error_1 = require("../../errors/services.error");
// ==================== PROJECT LOGIC ====================
class projectLogic {
    constructor(repository, validator) {
        this.repository = repository;
        this.validator = validator;
    }
    getAllProjects() {
        return __awaiter(this, arguments, void 0, function* (lang = "EN", params) {
            this.validator.validatePagination(params);
            const skip = params.skip || 0;
            const take = params.take || 10;
            const [projects, totalItems] = yield Promise.all([
                this.repository.findMany(lang, skip, take),
                this.repository.count(),
            ]);
            const remainingItems = totalItems - (skip * take + projects.length);
            return {
                data: projects.map((project) => {
                    const { image, technologies, ProjectTranslation } = project, rest = __rest(project, ["image", "technologies", "ProjectTranslation"]);
                    return {
                        project: rest,
                        image: image || null,
                        translation: ProjectTranslation,
                        technologies: technologies.map((tech) => tech.technology) || [],
                    };
                }),
                pagination: {
                    totalItems,
                    remainingItems,
                    nowCount: projects.length,
                    totalPages: Math.ceil(totalItems / take),
                    currentPage: skip + 1,
                    pageSize: take,
                },
            };
        });
    }
    create() {
        return __awaiter(this, arguments, void 0, function* (lang = "EN", data) {
            const dataCreate = this.validator.validateCreate(data);
            const slug = (0, slugify_1.default)(dataCreate.title + (0, crypto_1.randomUUID)().substring(0, 6), {
                lower: true,
            });
            const project = yield this.repository.create(lang, Object.assign(Object.assign({}, dataCreate), { slug }));
            if (!project)
                throw new services_error_1.ServiceError("error create project", 400, "PROJECT_CREATION_ERROR");
            return project;
        });
    }
    update() {
        return __awaiter(this, arguments, void 0, function* (lang = "EN", data) {
            const dataUpdate = this.validator.validateUpdate(data);
            const updateProject = yield this.repository.update(lang, dataUpdate);
            return updateProject;
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const validId = this.validator.validateId(id);
            const deleteProject = yield this.repository.delete(validId);
            return deleteProject;
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const validId = this.validator.validateId(id);
            const findProject = yield this.repository.findById(validId);
            return findProject;
        });
    }
    findBySlugFull(lang, slug) {
        return __awaiter(this, void 0, void 0, function* () {
            // const validId = this.validator.validateSlug(id);
            const findProject = yield this.repository.findBySlugFull(lang, slug);
            return findProject;
        });
    }
    // Technology methods
    createTechnology(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const validData = this.validator.validateCreateTechnology(data);
            const technology = yield this.repository.createTechnology(validData);
            if (!technology)
                throw new services_error_1.ServiceError("error create technology", 400, "TECHNOLOGY_CREATION_ERROR");
            return technology;
        });
    }
    createProjectAndAssignTechnology(lang, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const validData = this.validator.validateCreateProjectAndAssignTechsAndServices(data);
            const ProjectWithTechs = yield this.repository.CreateProjecAndAssignTechnologies(lang, validData);
            if (!ProjectWithTechs)
                throw new services_error_1.ServiceError("error create technology", 400, "TECHNOLOGY_CREATION_ERROR");
            return ProjectWithTechs;
        });
    }
    findTechById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const validId = this.validator.validateId(id);
            const technology = yield this.repository.findTechById(validId);
            return technology;
        });
    }
    // Project-Technology relationship methods
    assignProjectToTechnology() {
        return __awaiter(this, arguments, void 0, function* (lang = "EN", data) {
            const validData = this.validator.validateBulkAssign(data);
            const assigned = yield this.repository.assignProjectToTechnolgy(lang, validData.items);
            return assigned;
        });
    }
    removeProjectFromTechnology() {
        return __awaiter(this, arguments, void 0, function* (lang = "EN", data) {
            const validData = this.validator.validateBulkRemove(data);
            const removed = yield this.repository.removeProjectToTechnolgy(lang, validData.items);
            return removed;
        });
    }
    createTechnologyAndProject() {
        return __awaiter(this, arguments, void 0, function* (lang = "EN", data) {
            const validData = this.validator.validateCreateTechWithProjects(data);
            const result = yield this.repository.createTechnologyAndProject(lang, {
                CreateTechnology: {
                    icon: validData.technology.icon || null,
                    name: validData.technology.name,
                    category: validData.technology.category,
                },
                CreateProject: validData.projects.map((p) => {
                    const slug = (0, slugify_1.default)(validData.technology.name + (0, crypto_1.randomUUID)().substring(0, 6), { lower: true });
                    return Object.assign(Object.assign({}, p), { status: p.status, slug });
                }),
            });
            return result;
        });
    }
    createProjectAndTechnologies(data // : Promise<{ // createdProject: { // project: Project; // Image: Image | null;
    ) {
        return __awaiter(this, void 0, void 0, function* () {
            // const validData =
            //   this.validator.validateCreateProjectAndAssignTechs(data);
            // const slug = slugify(
            //   validData.project.title + randomUUID().substring(0, 6),
            //   { lower: true }
            // );
            // const result = await this.repository.createProjectAndTechnologies({
            //   project: { ...validData.project, slug },
            //   technologies: validData.technologies,
            // });
            // return result;
        });
    }
    // Get projects by technology
    getProjectsByTechnology(technologyId, params) {
        return __awaiter(this, void 0, void 0, function* () {
            this.validator.validatePagination(params);
            this.validator.validateId(technologyId);
            const skip = params.skip || 0;
            const take = params.take || 10;
            // You'll need to add this method to repository
            const [projects, totalItems] = yield Promise.all([
                this.repository.findProjectsByTechnology(technologyId, skip, take),
                this.repository.findProjectsByTechnologyCount(technologyId),
            ]);
            const remainingItems = totalItems - (skip * take + projects.length);
            return {
                data: projects,
                pagination: {
                    totalItems,
                    remainingItems,
                    nowCount: projects.length,
                    totalPages: Math.ceil(totalItems / take),
                    currentPage: skip + 1,
                    pageSize: take,
                },
            };
        });
    }
    // Get technologies by project
    getTechnologiesByProject(projectId, params) {
        return __awaiter(this, void 0, void 0, function* () {
            this.validator.validatePagination(params);
            this.validator.validateId(projectId);
            const skip = params.skip || 0;
            const take = params.take || 10;
            // You'll need to add this method to repository
            const [technologies, totalItems] = yield Promise.all([
                this.repository.findTechnologiesByProject(projectId, skip, take),
                this.repository.findTechnologiesByProjectCount(projectId),
            ]);
            const remainingItems = totalItems - (skip * take + technologies.length);
            return {
                data: technologies,
                pagination: {
                    totalItems,
                    remainingItems,
                    nowCount: technologies.length,
                    totalPages: Math.ceil(totalItems / take),
                    currentPage: skip + 1,
                    pageSize: take,
                },
            };
        });
    }
    searchProjects(searchTerm, params) {
        return __awaiter(this, void 0, void 0, function* () {
            this.validator.validatePagination(params);
            if (!searchTerm || searchTerm.trim().length === 0) {
                throw new services_error_1.ServiceError("Search term is required", 400, "INVALID_SEARCH_TERM");
            }
            const skip = params.skip || 0;
            const take = params.take || 10;
            const [projects, totalItems] = yield Promise.all([
                this.repository.searchProjects(searchTerm, skip, take),
                this.repository.countSearchResults(searchTerm),
            ]);
            const remainingItems = totalItems - (skip * take + projects.length);
            return {
                data: projects,
                pagination: {
                    totalItems,
                    remainingItems,
                    nowCount: projects.length,
                    totalPages: Math.ceil(totalItems / take),
                    currentPage: skip + 1,
                    pageSize: take,
                },
            };
        });
    }
    techSearch(searchTerm, params) {
        return __awaiter(this, void 0, void 0, function* () {
            this.validator.validatePagination(params);
            if (!searchTerm || searchTerm.trim().length === 0) {
                throw new services_error_1.ServiceError("Search term is required", 400, "INVALID_SEARCH_TERM");
            }
            const skip = params.skip || 0;
            const take = params.take || 10;
            const [technologies, totalItems] = yield Promise.all([
                this.repository.searchTechnologies(searchTerm, skip, take),
                this.repository.countSearchResultsTech(searchTerm),
            ]);
            const remainingItems = totalItems - (skip * take + technologies.length);
            return {
                data: technologies,
                pagination: {
                    totalItems,
                    remainingItems,
                    nowCount: technologies.length,
                    totalPages: Math.ceil(totalItems / take),
                    currentPage: skip + 1,
                    pageSize: take,
                },
            };
        });
    }
    getFeaturedProjects(params) {
        return __awaiter(this, void 0, void 0, function* () {
            this.validator.validatePagination(params);
            const skip = params.skip || 0;
            const take = params.take || 10;
            const [projects, totalItems] = yield Promise.all([
                this.repository.getFeaturedProjects(skip, take),
                this.repository.countFeaturedProjects(),
            ]);
            const remainingItems = totalItems - (skip * take + projects.length);
            return {
                data: projects,
                pagination: {
                    totalItems,
                    remainingItems,
                    nowCount: projects.length,
                    totalPages: Math.ceil(totalItems / take),
                    currentPage: skip + 1,
                    pageSize: take,
                },
            };
        });
    }
    getProjectsByStatus(status, params) {
        return __awaiter(this, void 0, void 0, function* () {
            this.validator.validatePagination(params);
            const skip = params.skip || 0;
            const take = params.take || 10;
            const [projects, totalItems] = yield Promise.all([
                this.repository.getProjectsByStatus(status, skip, take),
                this.repository.countProjectsByStatus(status),
            ]);
            const remainingItems = totalItems - (skip * take + projects.length);
            return {
                data: projects,
                pagination: {
                    totalItems,
                    remainingItems,
                    nowCount: projects.length,
                    totalPages: Math.ceil(totalItems / take),
                    currentPage: skip + 1,
                    pageSize: take,
                },
            };
        });
    }
    getAllTechnologies(params) {
        return __awaiter(this, void 0, void 0, function* () {
            this.validator.validatePagination(params);
            const skip = params.skip || 0;
            const take = params.take || 10;
            const [technologies, totalItems] = yield Promise.all([
                this.repository.findManyTechnologies(skip, take),
                this.repository.countTechnologies(),
            ]);
            const remainingItems = totalItems - (skip * take + technologies.length);
            return {
                data: technologies,
                pagination: {
                    totalItems,
                    remainingItems,
                    nowCount: technologies.length,
                    totalPages: Math.ceil(totalItems / take),
                    currentPage: skip + 1,
                    pageSize: take,
                },
            };
        });
    }
    updateTechnology(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            this.validator.validateId(id);
            const validData = this.validator.validateUpdateTechnology(data);
            const technology = yield this.repository.updateTechnology(id, validData);
            return technology;
        });
    }
    updateProjectWithTechsServices() {
        return __awaiter(this, arguments, void 0, function* (lang = "EN", data) {
            // Validate input
            const validatedData = this.validator.validateUpdateProjectWithTechsServices(data);
            // Extract project data and relationship changes
            const { id, deletedTechIds, newTechIds, deletedServiceIds, newServiceIds } = validatedData, projectData = __rest(validatedData, ["id", "deletedTechIds", "newTechIds", "deletedServiceIds", "newServiceIds"]);
            // Call repository method
            const result = yield this.repository.updateProjectWithTechsServices({
                id,
                projectData: projectData,
                deletedTechIds,
                newTechIds,
                deletedServiceIds,
                newServiceIds,
            }, lang);
            return result;
        });
    }
    deleteTechnology(id) {
        return __awaiter(this, void 0, void 0, function* () {
            this.validator.validateId(id);
            const technology = yield this.repository.deleteTechnology(id);
            return technology;
        });
    }
    getTechnologiesByCategory(category, params) {
        return __awaiter(this, void 0, void 0, function* () {
            this.validator.validatePagination(params);
            if (!category || category.trim().length === 0) {
                throw new services_error_1.ServiceError("Category is required", 400, "INVALID_CATEGORY");
            }
            const skip = params.skip || 0;
            const take = params.take || 10;
            const [technologies, totalItems] = yield Promise.all([
                this.repository.getTechnologiesByCategory(category, skip, take),
                this.repository.countTechnologiesByCategory(category),
            ]);
            const remainingItems = totalItems - (skip * take + technologies.length);
            return {
                data: technologies,
                pagination: {
                    totalItems,
                    remainingItems,
                    nowCount: technologies.length,
                    totalPages: Math.ceil(totalItems / take),
                    currentPage: skip + 1,
                    pageSize: take,
                },
            };
        });
    }
    getAllCategories(_a) {
        return __awaiter(this, arguments, void 0, function* ({ params, }) {
            const skip = params.skip || 0;
            const take = params.take || 10;
            const [categories, totalItems] = yield Promise.all([
                this.repository.getAllCategories({
                    skip,
                    take,
                }),
                this.repository.getCountCategories(),
            ]);
            const remainingItems = totalItems - (skip * take + categories.length);
            return {
                data: categories,
                pagination: {
                    totalItems,
                    remainingItems,
                    nowCount: categories.length,
                    totalPages: Math.ceil(totalItems / take),
                    currentPage: skip + 1,
                    pageSize: take,
                },
            };
        });
    }
    getCountCategories() {
        return __awaiter(this, void 0, void 0, function* () {
            const count = yield this.repository.getCountCategories();
            return count;
        });
    }
}
exports.projectLogic = projectLogic;
