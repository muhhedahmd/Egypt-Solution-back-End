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
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectController = void 0;
class projectController {
    constructor(logic) {
        this.logic = logic;
    }
    createProject(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const body = req.body;
                const image = (Array === null || Array === void 0 ? void 0 : Array.isArray(req.files)) && ((_a = req === null || req === void 0 ? void 0 : req.files) === null || _a === void 0 ? void 0 : _a.length) > 0
                    ? (_b = req === null || req === void 0 ? void 0 : req.files[0]) === null || _b === void 0 ? void 0 : _b.buffer
                    : null;
                const newProject = yield this.logic.create(Object.assign(Object.assign({}, body), { image: image, isFeatured: body.isFeatured === "true" ? true : false, order: Number(body.order) || 0, status: body.status || "COMPLETED", startDate: body.startDate ? new Date(body.startDate) : undefined, endDate: body.endDate ? new Date(body.endDate) : undefined }));
                return res.status(201).json({
                    success: true,
                    message: "Project created successfully",
                    data: newProject,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getAllProjects(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { skip, take } = req.query;
                const projects = yield this.logic.getAllProjects({
                    skip: Number(skip) || 0,
                    take: Number(take) || 10,
                });
                return res.status(200).json(Object.assign({ success: true, message: "Projects fetched successfully" }, projects));
            }
            catch (error) {
                next(error);
            }
        });
    }
    getProjectById(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const project = yield this.logic.findById(id);
                if (!project) {
                    return res.status(404).json({
                        success: false,
                        message: `Project with ID ${id} not found`,
                    });
                }
                return res.status(200).json({
                    success: true,
                    message: "Project fetched successfully",
                    data: project,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getProjectBySlugFull(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { slug } = req.params;
                const project = yield this.logic.findBySlugFull(slug);
                if (!project) {
                    return res.status(404).json({
                        success: false,
                        message: `Project with slug ${slug} not found`,
                    });
                }
                return res.status(200).json({
                    success: true,
                    message: "Project fetched successfully",
                    data: project,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    updateProject(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const body = req.body;
                const id = req.params.id;
                const file = req.file; // From multer
                const updated = yield this.logic.update(Object.assign(Object.assign({}, body), { id, image: file === null || file === void 0 ? void 0 : file.buffer, imageState: body.imageState || "KEEP", isFeatured: body.isFeatured === "true" ? true : false, order: Number(body.order) || undefined, status: body.status || undefined, startDate: body.startDate ? new Date(body.startDate) : undefined, endDate: body.endDate ? new Date(body.endDate) : undefined }));
                return res.status(200).json({
                    success: true,
                    message: "Project updated successfully",
                    data: updated,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    deleteProject(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const deleted = yield this.logic.delete(id);
                return res.status(200).json({
                    success: true,
                    message: "Project deleted successfully",
                    data: deleted,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    searchProjects(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { skip, take, q } = req.query;
                if (!q || typeof q !== "string") {
                    return res.status(400).json({
                        success: false,
                        message: "Search query 'q' is required",
                    });
                }
                const projects = yield this.logic.searchProjects(q, {
                    skip: Number(skip) || 0,
                    take: Number(take) || 10,
                });
                return res.status(200).json(Object.assign({ success: true, message: "Projects search results" }, projects));
            }
            catch (error) {
                next(error);
            }
        });
    }
    techSearch(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { skip, take, q } = req.query;
                if (!q || typeof q !== "string") {
                    return res.status(400).json({
                        success: false,
                        message: "Search query 'q' is required",
                    });
                }
                const projects = yield this.logic.techSearch(q, {
                    skip: Number(skip) || 0,
                    take: Number(take) || 10,
                });
                return res.status(200).json(Object.assign({ success: true, message: "Projects search results" }, projects));
            }
            catch (error) {
                next(error);
            }
        });
    }
    getFeaturedProjects(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { skip, take } = req.query;
                const projects = yield this.logic.getFeaturedProjects({
                    skip: Number(skip) || 0,
                    take: Number(take) || 10,
                });
                return res.status(200).json(Object.assign({ success: true, message: "Featured projects fetched successfully" }, projects));
            }
            catch (error) {
                next(error);
            }
        });
    }
    getProjectsByStatus(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { skip, take } = req.query;
                const { status } = req.params;
                const projects = yield this.logic.getProjectsByStatus(status, {
                    skip: Number(skip) || 0,
                    take: Number(take) || 10,
                });
                return res.status(200).json(Object.assign({ success: true, message: `Projects with status ${status} fetched successfully` }, projects));
            }
            catch (error) {
                next(error);
            }
        });
    }
    // TECHNOLOGY ENDPOINTS
    createTechnology(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const body = req.body;
                console.log({
                    name: body.name,
                    // icon: Array.isArray(req.files) && req.files ? req.files[0]?.buffer :  null,
                    category: body.category || "",
                });
                const newTechnology = yield this.logic.createTechnology({
                    name: body.name,
                    icon: Array.isArray(req === null || req === void 0 ? void 0 : req.files) && (req === null || req === void 0 ? void 0 : req.files)
                        ? (_b = (_a = req === null || req === void 0 ? void 0 : req.files) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.buffer
                        : null,
                    category: body.category || "",
                });
                return res.status(201).json({
                    success: true,
                    message: "Technology created successfully",
                    data: newTechnology,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getAllTechnologies(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { skip, take } = req.query;
                const technologies = yield this.logic.getAllTechnologies({
                    skip: Number(skip) || 0,
                    take: Number(take) || 10,
                });
                return res.status(200).json(Object.assign({ success: true, message: "Technologies fetched successfully" }, technologies));
            }
            catch (error) {
                next(error);
            }
        });
    }
    getTechnologyById(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const technology = yield this.logic.findTechById(id);
                if (!technology) {
                    return res.status(404).json({
                        success: false,
                        message: `Technology with ID ${id} not found`,
                    });
                }
                return res.status(200).json({
                    success: true,
                    message: "Technology fetched successfully",
                    data: technology,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    updateTechnology(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const body = req.body;
                const updated = yield this.logic.updateTechnology(id, {
                    name: body.name,
                    icon: body.icon,
                    category: body.category,
                });
                return res.status(200).json({
                    success: true,
                    message: "Technology updated successfully",
                    data: updated,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    deleteTechnology(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const deleted = yield this.logic.deleteTechnology(id);
                return res.status(200).json({
                    success: true,
                    message: "Technology deleted successfully",
                    data: deleted,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getTechnologiesByCategory(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { category } = req.params;
                const { skip, take } = req.query;
                const technologies = yield this.logic.getTechnologiesByCategory(category, {
                    skip: Number(skip) || 0,
                    take: Number(take) || 10,
                });
                return res.status(200).json(Object.assign({ success: true, message: `Technologies in category ${category} fetched successfully` }, technologies));
            }
            catch (error) {
                next(error);
            }
        });
    }
    getAllCategories(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { skip, take } = req.query;
                const categories = yield this.logic.getAllCategories({
                    params: {
                        skip: Number(skip) || 0,
                        take: Number(take) || 10,
                    },
                });
                return res.status(200).json({
                    message: "Categories fetched successfully",
                    data: categories.data,
                    pagination: categories.pagination,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    // PROJECT-TECHNOLOGY RELATIONSHIP ENDPOINTS
    assignProjectToTechnology(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const body = req.body;
                const assigned = yield this.logic.assignProjectToTechnology(body);
                return res.status(200).json({
                    success: true,
                    message: "Projects assigned to technology successfully",
                    data: assigned,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    createProjectAndAssignTechnology(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            try {
                // const project = req.body.project;
                // const technology = req.body.technologies;
                const _e = req.body, { technologies, services } = _e, project = __rest(_e, ["technologies", "services"]);
                console.log({
                    project: Object.assign(Object.assign({}, project), { image: (Array === null || Array === void 0 ? void 0 : Array.isArray(req === null || req === void 0 ? void 0 : req.files)) && (req === null || req === void 0 ? void 0 : req.files)
                            ? (_b = (_a = req === null || req === void 0 ? void 0 : req.files) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.buffer
                            : undefined }),
                    technologies: technologies ? JSON.parse(technologies) : [],
                    services: technologies ? JSON.parse(services) : [],
                });
                const created = yield this.logic.createProjectAndAssignTechnology({
                    project: Object.assign(Object.assign({}, project), { image: (Array === null || Array === void 0 ? void 0 : Array.isArray(req === null || req === void 0 ? void 0 : req.files)) && (req === null || req === void 0 ? void 0 : req.files)
                            ? (_d = (_c = req === null || req === void 0 ? void 0 : req.files) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.buffer
                            : undefined }),
                    technologies: technologies ? JSON.parse(technologies) : [],
                    services: technologies ? JSON.parse(services) : [],
                });
                return res.status(200).json({
                    success: true,
                    message: "Project and technology assigned successfully",
                    data: created,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    removeProjectFromTechnology(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const body = req.body;
                const removed = yield this.logic.removeProjectFromTechnology(body);
                return res.status(200).json({
                    success: true,
                    message: "Projects removed from technology successfully",
                    data: removed,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    createTechnologyWithProjects(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const technologyRaw = req.body.technology;
                const projectsRaw = req.body.projects;
                // 🔹 Parse JSON text fields
                const technology = JSON.parse(technologyRaw);
                const projects = JSON.parse(projectsRaw);
                console.log(req.files);
                const FixedBody = {
                    technology: {
                        name: technology.name,
                        icon: technology.icon,
                        category: technology.category,
                    },
                    projects: projects.map((p) => {
                        var _a;
                        return Object.assign(Object.assign({}, p), { image: (Array === null || Array === void 0 ? void 0 : Array.isArray(req.files)) && (req === null || req === void 0 ? void 0 : req.files)
                                ? (_a = req.files.find((f) => f.originalname === p.image)) === null || _a === void 0 ? void 0 : _a.buffer
                                : undefined });
                    }),
                };
                const result = yield this.logic.createTechnologyAndProject(FixedBody);
                return res.status(201).json({
                    success: true,
                    message: "Technology and projects created successfully",
                    data: result,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    //** */
    createProjectWithTechnologies(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const projectRaw = req.body.project;
                const technologiesRaw = req.body.technologies;
                // 🔹 Parse JSON text fields
                const project = JSON.parse(projectRaw);
                const technologies = JSON.parse(technologiesRaw);
                const result = yield this.logic.createProjectAndTechnologies({
                    project: Object.assign(Object.assign({}, project), { image: Array.isArray(req.files) && req.files
                            ? (_a = req.files.find((f) => f.originalname === project.image)) === null || _a === void 0 ? void 0 : _a.buffer
                            : undefined }),
                    technologies: technologies,
                });
                return res.status(201).json({
                    success: true,
                    message: "Project and technologies created successfully",
                    data: result,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getProjectsByTechnology(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { skip, take } = req.query;
                const projects = yield this.logic.getProjectsByTechnology(id, {
                    skip: Number(skip) || 0,
                    take: Number(take) || 10,
                });
                return res.status(200).json(Object.assign({ success: true, message: "Projects by technology fetched successfully" }, projects));
            }
            catch (error) {
                next(error);
            }
        });
    }
    getTechnologiesByProject(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { skip, take } = req.query;
                const technologies = yield this.logic.getTechnologiesByProject(id, {
                    skip: Number(skip) || 0,
                    take: Number(take) || 10,
                });
                return res.status(200).json(Object.assign({ success: true, message: "Technologies by project fetched successfully" }, technologies));
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.projectController = projectController;
