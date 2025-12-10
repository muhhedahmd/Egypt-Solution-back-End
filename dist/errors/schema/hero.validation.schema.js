"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeroValidator = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const hero_error_1 = require("../hero.error");
const createHeroSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(255).optional().default('Main Hero'),
    title: zod_1.z.string().min(1, 'Title is required').max(500),
    subtitle: zod_1.z.string().max(500).optional(),
    description: zod_1.z.string().optional(),
    backgroundColor: zod_1.z.string().optional(),
    backgroundVideo: zod_1.z.string().url('Invalid video URL').optional().or(zod_1.z.literal('')),
    overlayColor: zod_1.z.string().optional(),
    overlayOpacity: zod_1.z.number().min(0).max(1).optional(),
    ctaText: zod_1.z.string().max(100).optional(),
    ctaUrl: zod_1.z.string().optional(),
    ctaVariant: zod_1.z.nativeEnum(client_1.ButtonVariant).optional(),
    secondaryCtaText: zod_1.z.string().max(100).optional(),
    secondaryCtaUrl: zod_1.z.string().optional(),
    secondaryCtaVariant: zod_1.z.nativeEnum(client_1.ButtonVariant).optional(),
    alignment: zod_1.z.nativeEnum(client_1.TextAlign).optional(),
    variant: zod_1.z.nativeEnum(client_1.HeroVariant).optional().default(client_1.HeroVariant.CENTERED),
    minHeight: zod_1.z.number().int().min(200).max(2000).optional(),
    titleSize: zod_1.z.string().max(50).optional(),
    titleColor: zod_1.z.string().optional(),
    subtitleColor: zod_1.z.string().optional(),
    descriptionColor: zod_1.z.string().optional(),
    showScrollIndicator: zod_1.z.boolean().optional().default(false),
    customCSS: zod_1.z.string().optional(),
    styleOverrides: zod_1.z.any().optional(),
    isActive: zod_1.z.boolean().optional().default(true),
    backgroundImage: zod_1.z.instanceof(Buffer).optional(),
});
const updateHeroSchema = zod_1.z.object({
    heroId: zod_1.z.string().min(1, 'Hero ID is required'),
    name: zod_1.z.string().min(1).max(255).optional(),
    title: zod_1.z.string().min(1).max(500).optional(),
    subtitle: zod_1.z.string().max(500).optional(),
    description: zod_1.z.string().optional(),
    backgroundColor: zod_1.z.string().optional(),
    backgroundVideo: zod_1.z.string().url('Invalid video URL').optional().or(zod_1.z.literal('')),
    overlayColor: zod_1.z.string().optional(),
    overlayOpacity: zod_1.z.number().min(0).max(1).optional(),
    ctaText: zod_1.z.string().max(100).optional(),
    ctaUrl: zod_1.z.string().optional(),
    ctaVariant: zod_1.z.nativeEnum(client_1.ButtonVariant).optional(),
    secondaryCtaText: zod_1.z.string().max(100).optional(),
    secondaryCtaUrl: zod_1.z.string().optional(),
    secondaryCtaVariant: zod_1.z.nativeEnum(client_1.ButtonVariant).optional(),
    alignment: zod_1.z.nativeEnum(client_1.TextAlign).optional(),
    variant: zod_1.z.nativeEnum(client_1.HeroVariant).optional(),
    minHeight: zod_1.z.number().int().min(200).max(2000).optional(),
    titleSize: zod_1.z.string().max(50).optional(),
    titleColor: zod_1.z.string().optional(),
    subtitleColor: zod_1.z.string().optional(),
    descriptionColor: zod_1.z.string().optional(),
    showScrollIndicator: zod_1.z.boolean().optional(),
    customCSS: zod_1.z.string().optional(),
    styleOverrides: zod_1.z.any().optional(),
    isActive: zod_1.z.boolean().optional(),
    backgroundImage: zod_1.z.instanceof(Buffer).optional(),
    imageState: zod_1.z.enum(['KEEP', 'REMOVE', 'UPDATE']).optional(),
});
const idSchema = zod_1.z.string().min(1, 'ID is required');
class HeroValidator {
    validateCreate(data) {
        try {
            return createHeroSchema.parse(data);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const messages = error.errors
                    .map((e) => `${e.path.join('.')}: ${e.message}`)
                    .join(', ');
                throw new hero_error_1.HeroValidationError(`Validation failed: ${messages}`, 'CREATE_VALIDATION_ERROR');
            }
            throw new hero_error_1.HeroValidationError('Invalid hero data');
        }
    }
    validateUpdate(data) {
        try {
            return updateHeroSchema.parse(data);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const messages = error.errors
                    .map((e) => `${e.path.join('.')}: ${e.message}`)
                    .join(', ');
                throw new hero_error_1.HeroValidationError(`Validation failed: ${messages}`, 'UPDATE_VALIDATION_ERROR');
            }
            throw new hero_error_1.HeroValidationError('Invalid update data');
        }
    }
    validateId(id) {
        try {
            return idSchema.parse(id);
        }
        catch (error) {
            throw new hero_error_1.HeroValidationError('Invalid hero ID', 'INVALID_ID');
        }
    }
}
exports.HeroValidator = HeroValidator;
