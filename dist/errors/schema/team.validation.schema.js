"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamValidator = void 0;
const zod_1 = require("zod");
const team_error_1 = require("../team.error");
const createTeamMemberSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required').max(255, 'Name too long'),
    position: zod_1.z.string().min(1, 'Position is required').max(255, 'Position too long'),
    bio: zod_1.z.string().optional(),
    email: zod_1.z.string().email('Invalid email address').optional().or(zod_1.z.literal('')),
    phone: zod_1.z.string().optional(),
    linkedin: zod_1.z.string().url('Invalid LinkedIn URL').optional().or(zod_1.z.literal('')),
    github: zod_1.z.string().url('Invalid GitHub URL').optional().or(zod_1.z.literal('')),
    twitter: zod_1.z.string().url('Invalid Twitter URL').optional().or(zod_1.z.literal('')),
    isActive: zod_1.z.boolean().optional().default(true),
    isFeatured: zod_1.z.boolean().optional().default(false),
    order: zod_1.z.number().int().min(0).optional().default(0),
    image: zod_1.z.instanceof(Buffer).optional(),
});
const updateTeamMemberSchema = zod_1.z.object({
    teamId: zod_1.z.string().min(1, 'Team member ID is required'),
    name: zod_1.z.string().min(1).max(255).optional(),
    slug: zod_1.z.string().optional(),
    position: zod_1.z.string().min(1).max(255).optional(),
    bio: zod_1.z.string().optional(),
    email: zod_1.z.string().email('Invalid email address').optional().or(zod_1.z.literal('')),
    phone: zod_1.z.string().optional(),
    linkedin: zod_1.z.string().url('Invalid LinkedIn URL').optional().or(zod_1.z.literal('')),
    github: zod_1.z.string().url('Invalid GitHub URL').optional().or(zod_1.z.literal('')),
    twitter: zod_1.z.string().url('Invalid Twitter URL').optional().or(zod_1.z.literal('')),
    isActive: zod_1.z.boolean().optional(),
    isFeatured: zod_1.z.boolean().optional(),
    order: zod_1.z.number().int().min(0).optional(),
    image: zod_1.z.instanceof(Buffer).optional(),
    imageState: zod_1.z.enum(['KEEP', 'REMOVE', 'UPDATE']).optional(),
});
const idSchema = zod_1.z.string().min(1, 'ID is required');
const slugSchema = zod_1.z.string().min(1, 'Slug is required');
class TeamValidator {
    validateCreate(data) {
        try {
            return createTeamMemberSchema.parse(data);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
                throw new team_error_1.TeamValidationError(`Validation failed: ${messages}`, 'CREATE_VALIDATION_ERROR');
            }
            throw new team_error_1.TeamValidationError('Invalid team member data');
        }
    }
    validateUpdate(data) {
        try {
            return updateTeamMemberSchema.parse(data);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
                throw new team_error_1.TeamValidationError(`Validation failed: ${messages}`, 'UPDATE_VALIDATION_ERROR');
            }
            throw new team_error_1.TeamValidationError('Invalid update data');
        }
    }
    validateId(id) {
        try {
            return idSchema.parse(id);
        }
        catch (error) {
            throw new team_error_1.TeamValidationError('Invalid team member ID', 'INVALID_ID');
        }
    }
    validateSlug(slug) {
        try {
            return slugSchema.parse(slug);
        }
        catch (error) {
            throw new team_error_1.TeamValidationError('Invalid slug', 'INVALID_SLUG');
        }
    }
}
exports.TeamValidator = TeamValidator;
