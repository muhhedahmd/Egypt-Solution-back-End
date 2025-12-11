"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestimonialValidator = void 0;
const zod_1 = require("zod");
const testimonal_error_1 = require("../testimonal.error");
const createTestimonialSchema = zod_1.z.object({
    clientName: zod_1.z.string().min(1, 'Client name is required').max(255, 'Name too long'),
    clientPosition: zod_1.z.string().optional(),
    clientCompany: zod_1.z.string().optional(),
    content: zod_1.z.string().min(1, 'Content is required'),
    rating: zod_1.z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5').default(5),
    isActive: zod_1.z.boolean().optional().default(true),
    isFeatured: zod_1.z.boolean().optional().default(false),
    order: zod_1.z.number().int().min(0).optional().default(0),
    avatar: zod_1.z.instanceof(Buffer).optional(),
});
const updateTestimonialSchema = zod_1.z.object({
    testimonialId: zod_1.z.string().min(1, 'Testimonial ID is required'),
    clientName: zod_1.z.string().min(1).max(255).optional(),
    clientPosition: zod_1.z.string().optional(),
    clientCompany: zod_1.z.string().optional(),
    content: zod_1.z.string().min(1).optional(),
    rating: zod_1.z.number().int().min(1).max(5).optional(),
    isActive: zod_1.z.boolean().optional(),
    isFeatured: zod_1.z.boolean().optional(),
    order: zod_1.z.number().int().min(0).optional(),
    avatar: zod_1.z.instanceof(Buffer).optional(),
    avatarState: zod_1.z.enum(['KEEP', 'REMOVE', 'UPDATE']).optional(),
});
const idSchema = zod_1.z.string().min(1, 'ID is required');
class TestimonialValidator {
    validateCreate(data) {
        try {
            return createTestimonialSchema.parse(data);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
                throw new testimonal_error_1.TestimonialValidationError(`Validation failed: ${messages}`, 'CREATE_VALIDATION_ERROR');
            }
            throw new testimonal_error_1.TestimonialValidationError('Invalid testimonial data');
        }
    }
    validateUpdate(data) {
        try {
            return updateTestimonialSchema.parse(data);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
                throw new testimonal_error_1.TestimonialValidationError(`Validation failed: ${messages}`, 'UPDATE_VALIDATION_ERROR');
            }
            throw new testimonal_error_1.TestimonialValidationError('Invalid update data');
        }
    }
    validateId(id) {
        try {
            return idSchema.parse(id);
        }
        catch (error) {
            throw new testimonal_error_1.TestimonialValidationError('Invalid testimonial ID', 'INVALID_ID');
        }
    }
}
exports.TestimonialValidator = TestimonialValidator;
