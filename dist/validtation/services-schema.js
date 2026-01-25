"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServicesValidator = void 0;
const zod_1 = require("zod");
const services_error_1 = require("../errors/services.error");
class ServicesValidator {
    constructor() {
        this.createSchema = zod_1.z.object({
            name: zod_1.z
                .string()
                .min(3, "Name must be at least 3 characters")
                .max(100, "Name must be less than 100 characters"),
            description: zod_1.z
                .string()
                .min(10, "Description must be at least 10 characters")
                .max(500, "Description must be less than 500 characters"),
            richDescription: zod_1.z
                .string()
                .min(10, "Rich description must be at least 10 characters"),
            image: zod_1.z.instanceof(Buffer).optional(),
            iconImage: zod_1.z.instanceof(Buffer).optional(),
            icon: zod_1.z.string().optional(),
            price: zod_1.z.string().optional(),
            isActive: zod_1.z.boolean().default(true),
            isFeatured: zod_1.z.boolean().default(false),
            order: zod_1.z.number().int().min(0).default(0),
        });
        this.updateSchema = zod_1.z.object({
            name: zod_1.z.string().min(3).max(100).optional(),
            description: zod_1.z.string().min(10).max(500).optional(),
            richDescription: zod_1.z.string().min(10).optional(),
            image: zod_1.z.instanceof(Buffer).optional().nullable(),
            imageState: zod_1.z.enum(["KEEP", "REMOVE", "UPDATE"]).optional(),
            slug: zod_1.z.string().optional(),
            icon: zod_1.z.string().optional(),
            price: zod_1.z.string().optional(),
            isActive: zod_1.z.boolean().optional(),
            isFeatured: zod_1.z.boolean().optional(),
            order: zod_1.z.number().int().min(0).optional(),
        });
    }
    validateCreate(data) {
        try {
            return this.createSchema.parse(data);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                throw new services_error_1.ServiceValidationError(error.issues[0].message);
            }
            throw new services_error_1.ServiceValidationError("Invalid service data");
        }
    }
    validateUpdate(data) {
        try {
            console.log(data);
            return this.updateSchema.parse(data);
        }
        catch (error) {
            throw new services_error_1.ServiceValidationError("Invalid update data");
        }
    }
    validateId(id) {
        try {
            const idSchema = zod_1.z.string().cuid("Invalid service ID format");
            idSchema.parse(id);
        }
        catch (error) {
            throw new services_error_1.ServiceValidationError("Invalid service ID");
        }
    }
    validateSlug(slug) {
        if (!slug || typeof slug !== "string") {
            throw new services_error_1.ServiceValidationError("Invalid service slug");
        }
    }
}
exports.ServicesValidator = ServicesValidator;
