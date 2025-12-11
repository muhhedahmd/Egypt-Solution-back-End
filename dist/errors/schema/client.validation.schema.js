"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientValidator = void 0;
const zod_1 = require("zod");
const client_error_1 = require("../client.error");
const createClientSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required').max(255, 'Name too long'),
    description: zod_1.z.string().optional(),
    richDescription: zod_1.z.string().optional(),
    website: zod_1.z.string().url('Invalid website URL').optional().or(zod_1.z.literal('')),
    industry: zod_1.z.string().optional(),
    isActive: zod_1.z.boolean().optional().default(true),
    isFeatured: zod_1.z.boolean().optional().default(false),
    order: zod_1.z.number().int().min(0).optional().default(0),
    image: zod_1.z.instanceof(Buffer).optional(),
    logo: zod_1.z.instanceof(Buffer).optional(),
});
const updateClientSchema = zod_1.z.object({
    clientId: zod_1.z.string().min(1, 'Client ID is required'),
    name: zod_1.z.string().min(1).max(255).optional(),
    slug: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    richDescription: zod_1.z.string().optional(),
    website: zod_1.z.string().url('Invalid website URL').optional().or(zod_1.z.literal('')),
    industry: zod_1.z.string().optional(),
    isActive: zod_1.z.boolean().optional(),
    isFeatured: zod_1.z.boolean().optional(),
    order: zod_1.z.number().int().min(0).optional(),
    image: zod_1.z.instanceof(Buffer).optional(),
    logo: zod_1.z.instanceof(Buffer).optional(),
    imageState: zod_1.z.enum(['KEEP', 'REMOVE', 'UPDATE']).optional(),
    logoState: zod_1.z.enum(['KEEP', 'REMOVE', 'UPDATE']).optional(),
});
const idSchema = zod_1.z.string().min(1, 'ID is required');
const slugSchema = zod_1.z.string().min(1, 'Slug is required');
class ClientValidator {
    validateCreate(data) {
        try {
            return createClientSchema.parse(data);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
                throw new client_error_1.ClientValidationError(`Validation failed: ${messages}`, 'CREATE_VALIDATION_ERROR');
            }
            throw new client_error_1.ClientValidationError('Invalid client data');
        }
    }
    validateUpdate(data) {
        try {
            return updateClientSchema.parse(data);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
                throw new client_error_1.ClientValidationError(`Validation failed: ${messages}`, 'UPDATE_VALIDATION_ERROR');
            }
            throw new client_error_1.ClientValidationError('Invalid update data');
        }
    }
    validateId(id) {
        try {
            return idSchema.parse(id);
        }
        catch (error) {
            throw new client_error_1.ClientValidationError('Invalid client ID', 'INVALID_ID');
        }
    }
    validateSlug(slug) {
        try {
            return slugSchema.parse(slug);
        }
        catch (error) {
            throw new client_error_1.ClientValidationError('Invalid slug', 'INVALID_SLUG');
        }
    }
}
exports.ClientValidator = ClientValidator;
