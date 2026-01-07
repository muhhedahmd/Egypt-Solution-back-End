"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactValidator = exports.ZodValidationError = void 0;
const zod_1 = require("zod");
const contact_error_1 = require("../contact.error");
class ZodValidationError extends contact_error_1.ContactValidationError {
    constructor(errors, message) {
        const errorMessage = message ||
            `Validation failed: ${errors.errors
                .map((e) => `${e.path.join(".")}: ${e.message}`)
                .join(", ")}`;
        super(errorMessage, "ZOD_VALIDATION_ERROR", "ZodValidationError");
        this.errors = errors;
    }
    getFormattedErrors() {
        return this.errors.errors.reduce((acc, error) => {
            const path = error.path.join(".");
            acc[path] = error.message;
            return acc;
        }, {});
    }
}
exports.ZodValidationError = ZodValidationError;
class ContactValidator {
    paginationSchema() {
        return zod_1.z.object({
            skip: zod_1.z.number().int().min(0).optional().default(0),
            take: zod_1.z.number().int().min(1).max(100).optional().default(10),
        });
    }
    createContactSchema() {
        return zod_1.z.object({
            name: zod_1.z.string().min(1, "Name is required").max(255),
            email: zod_1.z.string().email("Invalid email address"),
            phone: zod_1.z
                .string()
                .regex(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, "Invalid phone number format")
                .nullable(),
            company: zod_1.z.string().min(1, "Company name must not be empty").max(255).nullable(),
            subject: zod_1.z.string().min(1, "Subject is required").max(255),
            message: zod_1.z.string().min(10, "Message must be at least 10 characters").max(5000),
            category: zod_1.z
                .enum([
                "GENERAL_INQUIRY",
                "SUPPORT",
                "SALES",
                "PARTNERSHIP",
                "FEEDBACK",
                "COMPLAINT",
                "SERVICE_INQUIRY",
                "OTHER",
            ])
                .default("GENERAL_INQUIRY"),
            serviceId: zod_1.z.string().cuid("Invalid service ID format").optional().nullable(),
            budget: zod_1.z.string().min(1, "Budget must not be empty").max(255).default("").optional().nullable(),
            timeline: zod_1.z.string().min(1, "Timeline must not be empty").max(255).default("").optional().nullable(),
            status: zod_1.z.enum(["NEW", "READ", "IN_PROGRESS", "RESOLVED", "CLOSED"]).default("NEW"),
            priority: zod_1.z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
            ipAddress: zod_1.z.string().default("").nullable(),
            userAgent: zod_1.z.string().default("").nullable(),
            source: zod_1.z.string().max(255).default("").nullable(),
            referrer: zod_1.z.string().url("Invalid referrer URL").default("").nullable(),
        });
    }
    updateContactSchema() {
        return zod_1.z.object({
            status: zod_1.z.enum(["NEW", "READ", "IN_PROGRESS", "RESOLVED", "CLOSED"]).optional(),
            priority: zod_1.z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
            notes: zod_1.z.string().max(5000).optional().nullable(),
            response: zod_1.z.string().max(5000).optional().nullable(),
            resolved: zod_1.z.boolean().optional(),
            respondedBy: zod_1.z.string().optional().nullable(),
            respondedAt: zod_1.z.date().optional().nullable(),
        });
    }
    paginationParamsValidation(params) {
        try {
            const parsed = this.paginationSchema().safeParse(params);
            if (!parsed.success) {
                throw new ZodValidationError(parsed.error, "Invalid pagination parameters");
            }
            return parsed.data;
        }
        catch (error) {
            if (error instanceof contact_error_1.ContactError) {
                throw error;
            }
            throw new contact_error_1.ContactValidationError("Invalid pagination parameters");
        }
    }
    createContactValidation(data) {
        try {
            const schema = this.createContactSchema();
            const parsed = schema.safeParse(data);
            if (!parsed.success) {
                throw new ZodValidationError(parsed.error, "Failed to validate contact data");
            }
            return parsed.data;
        }
        catch (error) {
            if (error instanceof contact_error_1.ContactError) {
                throw error;
            }
            if (error instanceof zod_1.z.ZodError) {
                throw new ZodValidationError(error);
            }
            throw new contact_error_1.ContactCreationError("Failed to validate contact data");
        }
    }
    updateContactValidation(data) {
        try {
            const schema = this.updateContactSchema();
            const parsed = schema.safeParse(data);
            if (!parsed.success) {
                throw new ZodValidationError(parsed.error, "Failed to validate update data");
            }
            return parsed.data;
        }
        catch (error) {
            if (error instanceof contact_error_1.ContactError) {
                throw error;
            }
            if (error instanceof zod_1.z.ZodError) {
                throw new ZodValidationError(error);
            }
            throw new contact_error_1.ContactUpdateError("Failed to validate update data");
        }
    }
    validateContactId(id) {
        try {
            const schema = zod_1.z.string().cuid("Invalid contact ID format");
            const parsed = schema.safeParse(id);
            if (!parsed.success) {
                throw new ZodValidationError(parsed.error, "Invalid contact ID");
            }
            return parsed.data;
        }
        catch (error) {
            if (error instanceof contact_error_1.ContactError) {
                throw error;
            }
            throw new contact_error_1.ContactValidationError("Invalid contact ID format");
        }
    }
    validateEmail(email) {
        try {
            const schema = zod_1.z.string().email("Invalid email format");
            const parsed = schema.safeParse(email);
            if (!parsed.success) {
                throw new ZodValidationError(parsed.error, "Invalid email");
            }
            return parsed.data;
        }
        catch (error) {
            if (error instanceof contact_error_1.ContactError) {
                throw error;
            }
            throw new contact_error_1.ContactValidationError("Invalid email format");
        }
    }
    validateBulkIds(ids) {
        try {
            const schema = zod_1.z.array(zod_1.z.string().cuid("Invalid ID format"));
            const parsed = schema.safeParse(ids);
            if (!parsed.success) {
                throw new ZodValidationError(parsed.error, "Invalid IDs in list");
            }
            return parsed.data;
        }
        catch (error) {
            if (error instanceof contact_error_1.ContactError) {
                throw error;
            }
            throw new contact_error_1.ContactValidationError("Invalid IDs in list");
        }
    }
    validateStatus(status) {
        try {
            const schema = zod_1.z.enum(["NEW", "READ", "IN_PROGRESS", "RESOLVED", "CLOSED"]);
            const parsed = schema.safeParse(status);
            if (!parsed.success) {
                throw new ZodValidationError(parsed.error, "Invalid contact status");
            }
            return parsed.data;
        }
        catch (error) {
            if (error instanceof contact_error_1.ContactError) {
                throw error;
            }
            throw new contact_error_1.ContactValidationError("Invalid contact status");
        }
    }
    validatePriority(priority) {
        try {
            const schema = zod_1.z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);
            const parsed = schema.safeParse(priority);
            if (!parsed.success) {
                throw new ZodValidationError(parsed.error, "Invalid priority level");
            }
            return parsed.data;
        }
        catch (error) {
            if (error instanceof contact_error_1.ContactError) {
                throw error;
            }
            throw new contact_error_1.ContactValidationError("Invalid priority level");
        }
    }
    validateCategory(category) {
        try {
            const schema = zod_1.z.enum([
                "GENERAL_INQUIRY",
                "SUPPORT",
                "SALES",
                "PARTNERSHIP",
                "FEEDBACK",
                "COMPLAINT",
                "SERVICE_INQUIRY",
                "OTHER",
            ]);
            const parsed = schema.safeParse(category);
            if (!parsed.success) {
                throw new ZodValidationError(parsed.error, "Invalid contact category");
            }
            return parsed.data;
        }
        catch (error) {
            if (error instanceof contact_error_1.ContactError) {
                throw error;
            }
            throw new contact_error_1.ContactValidationError("Invalid contact category");
        }
    }
}
exports.ContactValidator = ContactValidator;
