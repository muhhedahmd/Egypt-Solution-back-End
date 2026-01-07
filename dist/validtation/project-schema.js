"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsValidator = void 0;
const zod_1 = require("zod");
const services_error_1 = require("../errors/services.error");
const v4_1 = require("zod/v4");
class ProjectsValidator {
    constructor() {
        this.createSchema = zod_1.z.object({
            title: zod_1.z
                .string()
                .min(3, "Title must be at least 3 characters")
                .max(200, "Title must be less than 200 characters"),
            description: zod_1.z
                .string()
                .min(10, "Description must be at least 10 characters")
                .max(500, "Description must be less than 500 characters")
                .optional(),
            richDescription: zod_1.z
                .string()
                .min(10, "Rich description must be at least 10 characters"),
            clientName: zod_1.z.string().max(100).optional(),
            clientCompany: zod_1.z.string().max(100).optional(),
            projectUrl: zod_1.z.string().url("Invalid project URL").optional(),
            githubUrl: zod_1.z.string().url("Invalid GitHub URL").optional(),
            status: zod_1.z
                .enum(["COMPLETED", "IN_PROGRESS", "PLANNING", "ON_HOLD"])
                .default("COMPLETED"),
            startDate: zod_1.z.preprocess((val) => {
                if (typeof val === "string") {
                    return new Date(val).toISOString();
                }
            }, zod_1.z.string().datetime().optional().or(zod_1.z.date().optional())),
            endDate: zod_1.z.preprocess((val) => {
                if (typeof val === "string") {
                    return new Date(val).toISOString();
                }
            }, zod_1.z.string().datetime().optional().or(zod_1.z.date().optional())),
            image: zod_1.z.instanceof(Buffer).optional(),
            isFeatured: zod_1.z.preprocess((val) => val === "true" || val === true, zod_1.z.boolean().default(false)),
            order: zod_1.z.number().int().min(0).optional().default(0),
            technologyIds: zod_1.z.array(zod_1.z.string()).optional(),
            serviceIds: zod_1.z.array(zod_1.z.string()).optional(),
        });
        this.updateSchema = zod_1.z.object({
            id: zod_1.z.string().cuid("Invalid project ID"),
            title: zod_1.z.string().min(3).max(200).optional(),
            description: zod_1.z.string().min(10).max(500).optional(),
            richDescription: zod_1.z.string().min(10).optional(),
            clientName: zod_1.z.string().max(100).optional(),
            clientCompany: zod_1.z.string().max(100).optional(),
            projectUrl: zod_1.z.string().url("Invalid project URL").optional(),
            githubUrl: zod_1.z.string().url("Invalid GitHub URL").optional(),
            status: zod_1.z
                .enum(["COMPLETED", "IN_PROGRESS", "PLANNING", "ON_HOLD"])
                .optional(),
            startDate: zod_1.z.string().datetime().optional().or(zod_1.z.date().optional()),
            endDate: zod_1.z.string().datetime().optional().or(zod_1.z.date().optional()),
            image: zod_1.z.instanceof(Buffer).optional(),
            imageState: zod_1.z.enum(["KEEP", "REMOVE", "UPDATE"]).optional().default("KEEP"),
            slug: zod_1.z.string().optional(),
            isFeatured: zod_1.z.boolean().optional(),
            order: zod_1.z.number().int().min(0).optional(),
            technologyIds: zod_1.z.array(zod_1.z.string()).optional(),
            serviceIds: zod_1.z.array(zod_1.z.string()).optional(),
        });
        this.createTechnologySchema = zod_1.z.object({
            name: zod_1.z.string().min(2).max(100),
            icon: zod_1.z.instanceof(Buffer).optional(),
            category: zod_1.z.string().max(50).optional(),
        });
        this.paginationSchema = zod_1.z.object({
            skip: zod_1.z.number().int().min(0).default(0),
            take: zod_1.z.number().int().min(1).max(100).default(10),
        });
        this.bulkAssignSchema = zod_1.z.object({
            items: zod_1.z.array(zod_1.z.object({
                projectId: zod_1.z.string(),
                technologyId: zod_1.z.string(),
            })),
        });
        this.bulkRemoveSchema = zod_1.z.object({
            items: zod_1.z.array(zod_1.z.object({
                projectId: zod_1.z.string(),
                technologyId: zod_1.z.string(),
            })),
        });
        this.createTechWithProjectsSchema = zod_1.z.object({
            technology: zod_1.z.object({
                name: zod_1.z.string().min(2).max(100),
                icon: zod_1.z.instanceof(Buffer).optional(),
                category: zod_1.z.string().max(50).optional(),
            }),
            projects: zod_1.z.array(zod_1.z.object({
                title: zod_1.z.string().min(3).max(200),
                description: zod_1.z.string().min(10).max(500).optional(),
                richDescription: zod_1.z.string().min(10),
                clientName: zod_1.z.string().max(100).optional(),
                clientCompany: zod_1.z.string().max(100).optional(),
                projectUrl: zod_1.z.string().url().optional(),
                githubUrl: zod_1.z.string().url().optional(),
                status: zod_1.z
                    .enum(["COMPLETED", "IN_PROGRESS", "PLANNING", "ON_HOLD"])
                    .default("COMPLETED"),
                startDate: zod_1.z.string().datetime().optional().or(zod_1.z.date().optional()),
                endDate: zod_1.z.string().datetime().optional().or(zod_1.z.date().optional()),
                image: zod_1.z.instanceof(Buffer).optional(),
                isFeatured: zod_1.z.boolean().default(false),
                order: zod_1.z.number().int().min(0).default(0),
            })),
        });
        this.updateProjectWithTechsServicesSchema = zod_1.z.object({
            id: zod_1.z.string().cuid("Invalid project ID"),
            // Project fields
            title: zod_1.z.string().min(3).max(200).optional(),
            description: zod_1.z.string().min(10).max(500).optional(),
            richDescription: zod_1.z.string().min(10).optional(),
            clientName: zod_1.z.string().max(100).optional(),
            clientCompany: zod_1.z.string().max(100).optional(),
            projectUrl: zod_1.z.string().url("Invalid project URL").optional(),
            githubUrl: zod_1.z.string().url("Invalid GitHub URL").optional(),
            status: zod_1.z.enum(["COMPLETED", "IN_PROGRESS", "PLANNING", "ON_HOLD"]).optional(),
            startDate: zod_1.z.preprocess((val) => {
                if (typeof val === "string")
                    return new Date(val);
                return val;
            }, zod_1.z.date().optional()),
            endDate: zod_1.z.preprocess((val) => {
                if (typeof val === "string")
                    return new Date(val);
                return val;
            }, zod_1.z.date().optional()),
            image: zod_1.z.instanceof(Buffer).optional(),
            imageState: zod_1.z.enum(["KEEP", "REMOVE", "UPDATE"]).default("KEEP"),
            isFeatured: zod_1.z.preprocess((val) => val === "true" || val === true, zod_1.z.boolean().optional()),
            order: zod_1.z.preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), zod_1.z.number().int().min(0).optional()),
            // Relationship updates
            deletedTechIds: zod_1.z.preprocess((val) => (typeof val === "string" ? JSON.parse(val) : val), zod_1.z.array(zod_1.z.string().cuid()).default([])),
            newTechIds: zod_1.z.preprocess((val) => (typeof val === "string" ? JSON.parse(val) : val), zod_1.z.array(zod_1.z.string().cuid()).default([])),
            deletedServiceIds: zod_1.z.preprocess((val) => (typeof val === "string" ? JSON.parse(val) : val), zod_1.z.array(zod_1.z.string().cuid()).default([])),
            newServiceIds: zod_1.z.preprocess((val) => (typeof val === "string" ? JSON.parse(val) : val), zod_1.z.array(zod_1.z.string().cuid()).default([])),
        });
    }
    validateCreate(data) {
        try {
            return this.createSchema.parse(data);
        }
        catch (error) {
            throw new services_error_1.ServiceError("Invalid project data", undefined, "ProjectValidationError");
        }
    }
    validateUpdate(data) {
        try {
            return this.updateSchema.parse(data);
        }
        catch (error) {
            throw new services_error_1.ServiceValidationError("Invalid update data", undefined, "ProjectValidationError");
        }
    }
    validateUpdateProjectWithTechsServices(data) {
        var _a;
        try {
            return this.updateProjectWithTechsServicesSchema.parse(data);
        }
        catch (error) {
            if (error instanceof v4_1.ZodError) {
                const messages = (_a = error === null || error === void 0 ? void 0 : error.errors) === null || _a === void 0 ? void 0 : _a.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
                throw new services_error_1.ServiceValidationError("Invalid project update data", messages, "PROJECT_UPDATE_VALIDATION_ERROR");
            }
            throw new services_error_1.ServiceValidationError("Invalid project update data", undefined, "PROJECT_UPDATE_VALIDATION_ERROR");
        }
    }
    validateCreateProjectAndAssignTechsAndServices(data) {
        try {
            const x = zod_1.z
                .object({
                project: this.createSchema,
                technologies: zod_1.z.array(zod_1.z.string().cuid()).optional(),
                services: zod_1.z.array(zod_1.z.string().cuid()).optional(),
            })
                .parse(data);
            return x;
        }
        catch (error) {
            console.log(error);
            throw new services_error_1.ServiceValidationError("Invalid technology data");
        }
    }
    validatePagination(data) {
        try {
            return this.paginationSchema.parse(data);
        }
        catch (error) {
            throw new services_error_1.ServiceValidationError("Invalid pagination parameters");
        }
    }
    validateBulkAssign(data) {
        try {
            return this.bulkAssignSchema.parse(data);
        }
        catch (error) {
            throw new services_error_1.ServiceValidationError("Invalid bulk assign data");
        }
    }
    validateUpdateTechnology(data) {
        try {
            return this.createTechnologySchema.partial().parse(data);
        }
        catch (error) {
            throw new services_error_1.ServiceValidationError("Invalid update technology data");
        }
    }
    validateBulkRemove(data) {
        try {
            return this.bulkRemoveSchema.parse(data);
        }
        catch (error) {
            throw new services_error_1.ServiceValidationError("Invalid bulk remove data");
        }
    }
    validateCreateTechWithProjects(data) {
        try {
            return this.createTechWithProjectsSchema.parse(data);
        }
        catch (error) {
            console.log({ issues: error.issues });
            if (error instanceof v4_1.ZodError) {
                throw new services_error_1.ServiceValidationError("Invalid technology with projects data", undefined, "UNKNOWN_VALIDATION_ERROR");
            }
            throw new services_error_1.ServiceValidationError("Invalid technology with projects data", error.issues.map((issue) => issue.message).join(", "), "UNKNOWN_VALIDATION_ERROR");
        }
    }
    validateCreateTechnology(data) {
        try {
            const result = this.createTechnologySchema.parse(data);
            return result;
        }
        catch (error) {
            throw new services_error_1.ServiceValidationError("Invalid project with technologies data", undefined, "UNKNOWN_VALIDATION_ERROR");
        }
    }
    validateId(id) {
        if (!id || typeof id !== "string") {
            throw new services_error_1.ServiceValidationError("Invalid ID");
        }
        return id;
    }
}
exports.ProjectsValidator = ProjectsValidator;
