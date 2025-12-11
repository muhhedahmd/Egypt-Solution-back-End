"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlideShowValidator = void 0;
const zod_1 = require("zod");
const services_error_1 = require("../errors/services.error");
class SlideShowValidator {
    constructor() {
        this.createSchema = zod_1.z.object({
            title: zod_1.z
                .string()
                .min(3, "Title must be at least 3 characters")
                .max(100, "Title must be less than 100 characters"),
            // slug: z.string().min(3).max(100).regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
            description: zod_1.z
                .string()
                .min(10, "Description must be at least 10 characters")
                .max(500, "Description must be less than 500 characters")
                .optional(),
            type: zod_1.z.enum([
                "SERVICES",
                "PROJECTS",
                "TESTIMONIALS",
                "TEAM",
                "CLIENTS",
                "HERO",
                "CUSTOM",
            ], {
                errorMap: () => ({ message: "Invalid slideshow type" }),
            }),
            composition: zod_1.z.enum([
                "SINGLE",
                "GRID",
                "CAROUSEL",
                "STACKED",
                "FADE",
                "CUSTOM",
                "ZOOM",
                "PARALLAX",
                "COVERFLOW",
                "KEN_BURNS",
                "FLIP",
                "CUBE",
                "AUTO_GRID",
                "STORY",
                "FILMSTRIP",
                "LIGHTBOX",
                "MARQUEE",
            ], {
                errorMap: () => ({ message: "Invalid composition type" }),
            }),
            background: zod_1.z.string().optional(),
            isActive: zod_1.z.boolean().default(true),
            autoPlay: zod_1.z.boolean().default(false),
            interval: zod_1.z.number().min(1000).max(30000).default(5000),
            order: zod_1.z.number().int().min(0).default(0),
        });
        this.updateSchema = zod_1.z.object({
            slideShowId: zod_1.z.string().cuid("Invalid slideshow ID format"),
            title: zod_1.z.string().min(3).max(100).optional(),
            slug: zod_1.z.string().min(3).max(100).optional(),
            description: zod_1.z.string().min(10).max(500).optional(),
            type: zod_1.z
                .enum([
                "SERVICES",
                "PROJECTS",
                "TESTIMONIALS",
                "TEAM",
                "CLIENTS",
                "HERO",
                "CUSTOM",
            ])
                .optional(),
            composition: zod_1.z
                .enum([
                "SINGLE",
                "GRID",
                "CAROUSEL",
                "STACKED",
                "FADE",
                "CUSTOM",
                "ZOOM",
                "PARALLAX",
                "COVERFLOW",
                "KEN_BURNS",
                "FLIP",
                "CUBE",
                "AUTO_GRID",
                "STORY",
                "FILMSTRIP",
                "LIGHTBOX",
                "MARQUEE",
            ])
                .optional(),
            background: zod_1.z.string().optional(),
            isActive: zod_1.z.boolean().optional(),
            autoPlay: zod_1.z.boolean().optional(),
            interval: zod_1.z.number().min(1000).max(30000).optional(),
            order: zod_1.z.number().int().min(0).optional(),
        });
        this.attachGlobalSchema = zod_1.z.object({
            slideShowId: zod_1.z.string().cuid("Invalid slideshow ID"),
            attachType: zod_1.z.enum([
                "service",
                "client",
                "project",
                "testimonial",
                "teamMember",
            ]),
            attachId: zod_1.z.string().cuid("Invalid service ID"),
            order: zod_1.z.number().int().min(0).default(0),
            isVisible: zod_1.z.boolean().default(false),
            customTitle: zod_1.z.string().max(200).optional(),
            customDesc: zod_1.z.string().max(500).optional(),
        });
        this.validateTypeSchema = zod_1.z.object({
            type: zod_1.z.enum([
                "SERVICES",
                "PROJECTS",
                "TESTIMONIALS",
                "TEAM",
                "CLIENTS",
                "HERO",
                "CUSTOM",
            ]),
        });
        this.ModelTypeSchema = zod_1.z.object({
            type: zod_1.z.enum(["service", "client", "project", "testimonial", "teamMember"]),
        });
        this.bulkAttachSchema = zod_1.z.object({
            slideShowId: zod_1.z.string().cuid("Invalid slideshow ID"),
            items: zod_1.z
                .array(zod_1.z.object({
                type: zod_1.z.enum([
                    "service",
                    "client",
                    "project",
                    "testimonial",
                    "teamMember",
                ]),
                id: zod_1.z.string().cuid("Invalid item ID"),
                order: zod_1.z.preprocess((val) => Number(val), zod_1.z.number().int().min(0).default(0)),
                isVisible: zod_1.z.preprocess((val) => val === "true" || val === true, zod_1.z.boolean().default(true)),
                customTitle: zod_1.z.string().max(200).optional(),
                customDesc: zod_1.z.string().max(500).optional(),
            }))
                .min(1, "At least one item is required"),
        });
        this.deattchGlobalSchema = zod_1.z.object({
            slideShowId: zod_1.z.string().cuid("Invalid slideshow ID"),
            type: zod_1.z.enum(["service", "client", "project", "testimonial", "teamMember"]),
            id: zod_1.z.string().cuid("Invalid service ID"),
        });
        this.bulkDeattachSchema = zod_1.z.object({
            slideShowId: zod_1.z.string().cuid("Invalid slideshow ID"),
            items: zod_1.z
                .array(this.deattchGlobalSchema.omit({ slideShowId: true }))
                .min(1, "At least one item is required"),
        });
        this.validateCreateAndAttachManySchema = this.createSchema.extend({
            slides: this.attachGlobalSchema.omit({ slideShowId: true }).array(),
        });
        this.reorderSchema = zod_1.z.object({
            slideShowId: zod_1.z.string().cuid("Invalid slideshow ID"),
            items: zod_1.z
                .array(zod_1.z.object({
                id: zod_1.z.string().cuid("Invalid item ID"),
                order: zod_1.z.number().int().min(0),
            }))
                .min(1, "At least one item is required"),
        });
        this.paginationSchema = zod_1.z.object({
            skip: zod_1.z.preprocess((val) => Number(val), zod_1.z.number().int().min(0).default(0)),
            take: zod_1.z.preprocess((val) => Number(val), zod_1.z.number().int().min(0).default(0)),
        });
        this.bulkReorderSchema = zod_1.z.array(zod_1.z.object({
            id: zod_1.z.string().cuid("Invalid slide Show ID"),
            order: zod_1.z.number().int().min(0, "Reading time must be positive"),
        }));
        this.validateUpdateAndAttachManySchema = zod_1.z.object({
            id: zod_1.z.string().cuid("Invalid slideshow ID format"),
            // Optional slideshow update fields
            title: zod_1.z.string().min(3).max(100).optional(),
            description: zod_1.z.string().min(10).max(500).optional(),
            type: zod_1.z
                .enum([
                "SERVICES",
                "PROJECTS",
                "TESTIMONIALS",
                "TEAM",
                "CLIENTS",
                "HERO",
                "CUSTOM",
            ])
                .optional(),
            composition: zod_1.z
                .enum([
                "SINGLE",
                "GRID",
                "CAROUSEL",
                "STACKED",
                "FADE",
                "CUSTOM",
                "ZOOM",
                "PARALLAX",
                "COVERFLOW",
                "KEN_BURNS",
                "FLIP",
                "CUBE",
                "AUTO_GRID",
                "STORY",
                "FILMSTRIP",
                "LIGHTBOX",
                "MARQUEE",
            ])
                .optional(),
            background: zod_1.z.string().optional(),
            isActive: zod_1.z.boolean().optional(),
            autoPlay: zod_1.z.boolean().optional(),
            interval: zod_1.z.number().min(1000).max(30000).optional(),
            order: zod_1.z.number().int().min(0).optional(),
            // New slides to attach
            newSlides: zod_1.z
                .array(zod_1.z.object({
                type: zod_1.z.enum([
                    "service",
                    "client",
                    "project",
                    "testimonial",
                    "teamMember",
                ]),
                id: zod_1.z.string().cuid("Invalid item ID"),
                order: zod_1.z.number().int().min(0),
                isVisible: zod_1.z.boolean(),
                customTitle: zod_1.z.string().max(200).optional(),
                customDesc: zod_1.z.string().max(500).optional(),
            }))
                .optional(),
            // Slides to delete (by attachment ID)
            deleted: zod_1.z
                .array(zod_1.z.object({
                id: zod_1.z.string().cuid("Invalid attachment ID"),
                type: zod_1.z.enum([
                    "service",
                    "client",
                    "project",
                    "testimonial",
                    "teamMember",
                ]),
            }))
                .optional(),
            // Slides to update (by attachment ID)
            updated: zod_1.z
                .array(zod_1.z.object({
                id: zod_1.z.string().cuid("Invalid attachment ID"),
                type: zod_1.z.enum([
                    "service",
                    "client",
                    "project",
                    "testimonial",
                    "teamMember",
                ]),
                order: zod_1.z.number().int().min(0),
                isVisible: zod_1.z.boolean(),
                customTitle: zod_1.z.string().max(200).optional(),
                customDesc: zod_1.z.string().max(500).optional(),
            }))
                .optional(),
        });
    }
    validateType(data) {
        try {
            const r = this.validateTypeSchema.parse(data);
            return r.type;
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const messages = error.errors
                    .map((e) => `${e.path.join(".")}: ${e.message}`)
                    .join(", ");
                throw new services_error_1.ServiceValidationError(`Validation failed: ${messages}`, undefined, "SlideShowValidationError");
            }
            throw new services_error_1.ServiceValidationError("Invalid pagination data", undefined, "SlideShowValidationError");
        }
    }
    validateModelNaming(data) {
        try {
            const r = this.ModelTypeSchema.parse(data);
            return r.type;
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const messages = error.errors
                    .map((e) => `${e.path.join(".")}: ${e.message}`)
                    .join(", ");
                throw new services_error_1.ServiceValidationError(`Validation failed: ${messages}`, undefined, "SlideShowValidationError");
            }
            throw new services_error_1.ServiceValidationError("Invalid pagination data", undefined, "SlideShowValidationError");
        }
    }
    validatePagination(data) {
        try {
            return this.paginationSchema.parse(data);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const messages = error.errors
                    .map((e) => `${e.path.join(".")}: ${e.message}`)
                    .join(", ");
                throw new services_error_1.ServiceValidationError(`Validation failed: ${messages}`, undefined, "SlideShowValidationError");
            }
            throw new services_error_1.ServiceValidationError("Invalid pagination data", undefined, "SlideShowValidationError");
        }
    }
    validateCreate(data) {
        try {
            return this.createSchema.parse(data);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const messages = error.errors
                    .map((e) => `${e.path.join(".")}: ${e.message}`)
                    .join(", ");
                throw new services_error_1.ServiceValidationError(`Validation failed: ${messages}`, undefined, "SlideShowValidationError");
            }
            throw new services_error_1.ServiceValidationError("Invalid slideshow data", undefined, "SlideShowValidationError");
        }
    }
    validateUpdate(data) {
        try {
            return this.updateSchema.parse(data);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const messages = error.errors
                    .map((e) => `${e.path.join(".")}: ${e.message}`)
                    .join(", ");
                throw new services_error_1.ServiceValidationError(`Validation failed: ${messages}`, undefined, "SlideShowValidationError");
            }
            throw new services_error_1.ServiceValidationError("Invalid update data", undefined, "SlideShowValidationError");
        }
    }
    validateAttachGlobal(data) {
        try {
            return this.attachGlobalSchema.parse(data);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const messages = error.errors
                    .map((e) => `${e.path.join(".")}: ${e.message}`)
                    .join(", ");
                throw new services_error_1.ServiceValidationError(`Validation failed: ${messages}`, undefined, "SlideShowValidationError");
            }
            throw new services_error_1.ServiceValidationError("Invalid attachment data", undefined, "SlideShowValidationError");
        }
    }
    validateDeattachGlobal(data) {
        try {
            return this.deattchGlobalSchema.parse(data);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const messages = error.errors
                    .map((e) => `${e.path.join(".")}: ${e.message}`)
                    .join(", ");
                throw new services_error_1.ServiceValidationError(`Validation failed: ${messages}`, undefined, "SlideShowValidationError");
            }
            throw new services_error_1.ServiceValidationError("Invalid attachment data", undefined, "SlideShowValidationError");
        }
    }
    validateBulkAttach(data) {
        try {
            return this.bulkAttachSchema.parse(data);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const messages = error.errors
                    .map((e) => `${e.path.join(".")}: ${e.message}`)
                    .join(", ");
                throw new services_error_1.ServiceValidationError(`Validation failed: ${messages}`, undefined, "SlideShowValidationError");
            }
            throw new services_error_1.ServiceValidationError("Invalid bulk attachment data", undefined, "SlideShowValidationError");
        }
    }
    validateBulkDeattach(data) {
        try {
            return this.bulkDeattachSchema.parse(data);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const messages = error.errors
                    .map((e) => `${e.path.join(".")}: ${e.message}`)
                    .join(", ");
                throw new services_error_1.ServiceValidationError(`Validation failed: ${messages}`, undefined, "SlideShowValidationError");
            }
            throw new services_error_1.ServiceValidationError("Invalid bulk attachment data", undefined, "SlideShowValidationError");
        }
    }
    validCreateAndAttachManySchema(data) {
        try {
            const parsed = this.validateCreateAndAttachManySchema.parse(data);
            return parsed;
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const messages = error.errors
                    .map((e) => `${e.path.join(".")}: ${e.message}`)
                    .join(", ");
                throw new services_error_1.ServiceValidationError(`Validation failed: ${messages}`, undefined, "SlideShowValidationError");
            }
        }
    }
    validateReorder(data) {
        try {
            return this.reorderSchema.parse(data);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const messages = error.errors
                    .map((e) => `${e.path.join(".")}: ${e.message}`)
                    .join(", ");
                throw new services_error_1.ServiceValidationError(`Validation failed: ${messages}`, undefined, "SlideShowValidationError");
            }
            throw new services_error_1.ServiceValidationError("Invalid reorder data", undefined, "SlideShowValidationError");
        }
    }
    validateId(id) {
        const idSchema = zod_1.z.string().cuid("Invalid slideshow ID format");
        try {
            return idSchema.parse(id);
        }
        catch (error) {
            throw new services_error_1.ServiceValidationError("Invalid slideshow ID", undefined, "SlideShowValidationError");
        }
    }
    validateSlug(slug) {
        const slugSchema = zod_1.z
            .string()
            .min(3)
            .max(100)
            .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens");
        try {
            slugSchema.parse(slug);
        }
        catch (error) {
            throw new services_error_1.ServiceValidationError("Invalid slug format", undefined, "SlideShowValidationError");
        }
    }
    validateBulkReorder(data) {
        try {
            return this.bulkReorderSchema.parse(data);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const messages = error.errors
                    .map((e) => `${e.path.join(".")}: ${e.message}`)
                    .join(", ");
                throw new services_error_1.ServiceValidationError(`Validation failed: ${messages}`, undefined, "SlideShowValidationError");
            }
            throw new services_error_1.ServiceValidationError("Invalid bulk reorder data", undefined, "SlideShowValidationError");
        }
    }
    // ============================================================================
    // VALIDATOR METHOD (Add this to SlideShowValidator class)
    // ============================================================================
    validUpdateAndAttachManySchema(data) {
        try {
            const parsed = this.validateUpdateAndAttachManySchema.parse(data);
            return parsed;
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const messages = error.errors
                    .map((e) => `${e.path.join(".")}: ${e.message}`)
                    .join(", ");
                throw new services_error_1.ServiceValidationError(`Validation failed: ${messages}`, undefined, "SlideShowValidationError");
            }
            throw new services_error_1.ServiceValidationError("Invalid update and attach data", undefined, "SlideShowValidationError");
        }
    }
    validateBulkSlideOperations(data) {
        try {
            const schema = zod_1.z.object({
                slideShowId: zod_1.z.string().cuid("Invalid slideshow ID"),
                newSlides: zod_1.z
                    .array(zod_1.z.object({
                    id: zod_1.z.string().cuid("Invalid resource ID"),
                    type: zod_1.z.enum([
                        "service",
                        "client",
                        "project",
                        "testimonial",
                        "team",
                    ]),
                    isVisible: zod_1.z.boolean(),
                    customTitle: zod_1.z.string().optional(),
                    customDescription: zod_1.z.string().optional(),
                    order: zod_1.z.number().int().min(0),
                }))
                    .optional()
                    .default([]),
                updateSlides: zod_1.z
                    .array(zod_1.z.object({
                    id: zod_1.z.string().cuid("Invalid junction table ID"),
                    type: zod_1.z.enum([
                        "service",
                        "client",
                        "project",
                        "testimonial",
                        "team",
                    ]),
                    isVisible: zod_1.z.boolean().optional(),
                    customTitle: zod_1.z.string().optional(),
                    customDescription: zod_1.z.string().optional(),
                }))
                    .optional()
                    .default([]),
                deletedSlides: zod_1.z
                    .array(zod_1.z.object({
                    id: zod_1.z.string().cuid("Invalid junction table ID"),
                    type: zod_1.z.enum([
                        "service",
                        "client",
                        "project",
                        "testimonial",
                        "team",
                    ]),
                }))
                    .optional()
                    .default([]),
                updatedOrder: zod_1.z
                    .array(zod_1.z.object({
                    id: zod_1.z.string().cuid("Invalid junction table ID"),
                    type: zod_1.z.enum([
                        "service",
                        "client",
                        "project",
                        "testimonial",
                        "team",
                    ]),
                    order: zod_1.z.number().int().min(0),
                }))
                    .optional()
                    .default([]),
            });
            const result = schema.parse(data);
            return result;
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const messages = error.errors
                    .map((e) => `${e.path.join(".")}: ${e.message}`)
                    .join(", ");
                throw new services_error_1.ServiceValidationError(`Validation failed: ${messages}`, undefined, "SlideShowValidationError");
            }
            throw new services_error_1.ServiceValidationError("Invalid update and attach data", undefined, "SlideShowValidationError");
        }
    }
}
exports.SlideShowValidator = SlideShowValidator;
// private attachServiceSchema = z.object({
//   slideShowId: z.string().cuid("Invalid slideshow ID"),
//   serviceId: z.string().cuid("Invalid service ID"),
//   order: z.number().int().min(0).default(0),
//   isVisible: z.boolean().default(true),
//   customTitle: z.string().max(200).optional(),
//   customDesc: z.string().max(500).optional(),
// private attachProjectSchema = z.object({
//   slideShowId: z.string().cuid("Invalid slideshow ID"),
//   projectId: z.string().cuid("Invalid project ID"),
//   order: z.number().int().min(0).default(0),
//   isVisible: z.boolean().default(true),
// });
// private attachClientSchema = z.object({
//   slideShowId: z.string().cuid("Invalid slideshow ID"),
//   clientId: z.string().cuid("Invalid client ID"),
//   order: z.number().int().min(0).default(0),
//   isVisible: z.boolean().default(true),
// });
// private attachTestimonialSchema = z.object({
//   slideShowId: z.string().cuid("Invalid slideshow ID"),
//   testimonialId: z.string().cuid("Invalid testimonial ID"),
//   order: z.number().int().min(0).default(0),
//   isVisible: z.boolean().default(true),
// });
// private attachTeamSchema = z.object({
//   slideShowId: z.string().cuid("Invalid slideshow ID"),
//   teamId: z.string().cuid("Invalid team member ID"),
//   order: z.number().int().min(0).default(0),
//   isVisible: z.boolean().default(true),
// });
// validateAttachProject(data: unknown) {
//   try {
//     return this.attachProjectSchema.parse(data);
//   } catch (error) {
//     if (error instanceof z.ZodError) {
//       const messages = error.errors
//         .map((e) => `${e.path.join(".")}: ${e.message}`)
//         .join(", ");
//       throw new ServiceValidationError(
//         `Validation failed: ${messages}`,
//         undefined,
//         "SlideShowValidationError"
//       );
//     }
//     throw new ServiceValidationError(
//       "Invalid project attachment data",
//       undefined,
//       "SlideShowValidationError"
//     );
//   }
// }
// validateAttachClient(data: unknown) {
//   try {
//     return this.attachClientSchema.parse(data);
//   } catch (error) {
//     if (error instanceof z.ZodError) {
//       const messages = error.errors
//         .map((e) => `${e.path.join(".")}: ${e.message}`)
//         .join(", ");
//       throw new ServiceValidationError(
//         `Validation failed: ${messages}`,
//         undefined,
//         "SlideShowValidationError"
//       );
//     }
//     throw new ServiceValidationError(
//       "Invalid client attachment data",
//       undefined,
//       "SlideShowValidationError"
//     );
//   }
// }
// validateAttachTestimonial(data: unknown) {
//   try {
//     return this.attachTestimonialSchema.parse(data);
//   } catch (error) {
//     if (error instanceof z.ZodError) {
//       const messages = error.errors
//         .map((e) => `${e.path.join(".")}: ${e.message}`)
//         .join(", ");
//       throw new ServiceValidationError(
//         `Validation failed: ${messages}`,
//         undefined,
//         "SlideShowValidationError"
//       );
//     }
//     throw new ServiceValidationError(
//       "Invalid testimonial attachment data",
//       undefined,
//       "SlideShowValidationError"
//     );
//   }
// }
// validateAttachTeam(data: unknown) {
//   try {
//     return this.attachTeamSchema.parse(data);
//   } catch (error) {
//     if (error instanceof z.ZodError) {
//       const messages = error.errors
//         .map((e) => `${e.path.join(".")}: ${e.message}`)
//         .join(", ");
//       throw new ServiceValidationError(
//         `Validation failed: ${messages}`,
//         undefined,
//         "SlideShowValidationError"
//       );
//     }
//     throw new ServiceValidationError(
//       "Invalid team attachment data",
//       undefined,
//       "SlideShowValidationError"
//     );
//   }
// }
