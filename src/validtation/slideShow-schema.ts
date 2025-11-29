import { z } from "zod";
import { ServiceValidationError } from "../errors/services.error";
import {
  CreateslideShowDTO,
  PaginationDTO,
  UpdateslideShowDTO,
  deattachManyDTO,
} from "../types/slideShow";
import { SlideshowType } from "@prisma/client";
export class SlideShowValidator {
  private createSchema = z.object({
    title: z
      .string()
      .min(3, "Title must be at least 3 characters")
      .max(100, "Title must be less than 100 characters"),
    // slug: z.string().min(3).max(100).regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters")
      .max(500, "Description must be less than 500 characters")
      .optional(),
    type: z.enum(
      [
        "SERVICES",
        "PROJECTS",
        "TESTIMONIALS",
        "TEAM",
        "CLIENTS",
        "HERO",
        "CUSTOM",
      ],
      {
        errorMap: () => ({ message: "Invalid slideshow type" }),
      }
    ),
    composition: z.enum(
      [
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
      ],
      {
        errorMap: () => ({ message: "Invalid composition type" }),
      }
    ),
    background: z.string().optional(),
    isActive: z.boolean().default(true),
    autoPlay: z.boolean().default(false),
    interval: z.number().min(1000).max(30000).default(5000),
    order: z.number().int().min(0).default(0),
  });

  private updateSchema = z.object({
    slideShowId: z.string().cuid("Invalid slideshow ID format"),
    title: z.string().min(3).max(100).optional(),
    slug: z.string().min(3).max(100).optional(),
    description: z.string().min(10).max(500).optional(),
    type: z
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
    composition: z.enum(
      [
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
    background: z.string().optional(),
    isActive: z.boolean().optional(),
    autoPlay: z.boolean().optional(),
    interval: z.number().min(1000).max(30000).optional(),
    order: z.number().int().min(0).optional(),
  });

  private attachGlobalSchema = z.object({
    slideShowId: z.string().cuid("Invalid slideshow ID"),
    attachType: z.enum([
      "service",
      "client",
      "project",
      "testimonial",
      "teamMember",
    ]),
    attachId: z.string().cuid("Invalid service ID"),
    order: z.number().int().min(0).default(0),
    isVisible: z.boolean().default(false),
    customTitle: z.string().max(200).optional(),
    customDesc: z.string().max(500).optional(),
  });
  private validateTypeSchema = z.object({
    type: z.enum([
      "SERVICES",
      "PROJECTS",
      "TESTIMONIALS",
      "TEAM",
      "CLIENTS",
      "HERO",
      "CUSTOM",
    ]),
  });

  private ModelTypeSchema = z.object({
    type: z.enum(["service", "client", "project", "testimonial", "teamMember"]),
  });

  private bulkAttachSchema = z.object({
    slideShowId: z.string().cuid("Invalid slideshow ID"),
    items: z
      .array(
        z.object({
          type: z.enum([
            "service",
            "client",
            "project",
            "testimonial",
            "teamMember",
          ]),
          id: z.string().cuid("Invalid item ID"),
          order: z.preprocess(
            (val) => Number(val),
            z.number().int().min(0).default(0)
          ),
          isVisible: z.preprocess(
            (val) => val === "true" || val === true,
            z.boolean().default(true)
          ),
          customTitle: z.string().max(200).optional(),
          customDesc: z.string().max(500).optional(),
        })
      )
      .min(1, "At least one item is required"),
  });

  private deattchGlobalSchema = z.object({
    slideShowId: z.string().cuid("Invalid slideshow ID"),
    type: z.enum(["service", "client", "project", "testimonial", "teamMember"]),
    id: z.string().cuid("Invalid service ID"),
  });
  private bulkDeattachSchema = z.object({
    slideShowId: z.string().cuid("Invalid slideshow ID"),
    items: z
      .array(this.deattchGlobalSchema.omit({ slideShowId: true }))
      .min(1, "At least one item is required"),
  });

  private validateCreateAndAttachManySchema = this.createSchema.extend({
    slides: this.attachGlobalSchema.omit({ slideShowId: true }).array(),
  });
  private reorderSchema = z.object({
    slideShowId: z.string().cuid("Invalid slideshow ID"),
    items: z
      .array(
        z.object({
          id: z.string().cuid("Invalid item ID"),
          order: z.number().int().min(0),
        })
      )
      .min(1, "At least one item is required"),
  });

  private paginationSchema = z.object({
    skip: z.preprocess(
      (val) => Number(val),
      z.number().int().min(0).default(0)
    ),
    take: z.preprocess(
      (val) => Number(val),
      z.number().int().min(0).default(0)
    ),
  });

  validateType(data: unknown): SlideshowType {
    try {
      const r = this.validateTypeSchema.parse(data);
      return r.type;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.errors
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join(", ");
        throw new ServiceValidationError(
          `Validation failed: ${messages}`,
          undefined,
          "SlideShowValidationError"
        );
      }
      throw new ServiceValidationError(
        "Invalid pagination data",
        undefined,
        "SlideShowValidationError"
      );
    }
  }
  validateModelNaming(
    data: unknown
  ): "service" | "client" | "project" | "testimonial" | "teamMember" {
    try {
      const r = this.ModelTypeSchema.parse(data);
      return r.type;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.errors
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join(", ");
        throw new ServiceValidationError(
          `Validation failed: ${messages}`,
          undefined,
          "SlideShowValidationError"
        );
      }
      throw new ServiceValidationError(
        "Invalid pagination data",
        undefined,
        "SlideShowValidationError"
      );
    }
  }
  validatePagination(data: unknown): PaginationDTO {
    try {
      return this.paginationSchema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.errors
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join(", ");
        throw new ServiceValidationError(
          `Validation failed: ${messages}`,
          undefined,
          "SlideShowValidationError"
        );
      }
      throw new ServiceValidationError(
        "Invalid pagination data",
        undefined,
        "SlideShowValidationError"
      );
    }
  }

  validateCreate(data: unknown): Omit<CreateslideShowDTO, "slug"> {
    try {
      return this.createSchema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.errors
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join(", ");
        throw new ServiceValidationError(
          `Validation failed: ${messages}`,
          undefined,
          "SlideShowValidationError"
        );
      }
      throw new ServiceValidationError(
        "Invalid slideshow data",
        undefined,
        "SlideShowValidationError"
      );
    }
  }

  validateUpdate(data: unknown): UpdateslideShowDTO {
    try {
      return this.updateSchema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.errors
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join(", ");
        throw new ServiceValidationError(
          `Validation failed: ${messages}`,
          undefined,
          "SlideShowValidationError"
        );
      }
      throw new ServiceValidationError(
        "Invalid update data",
        undefined,
        "SlideShowValidationError"
      );
    }
  }

  validateAttachGlobal(data: unknown) {
    try {
      return this.attachGlobalSchema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.errors
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join(", ");
        throw new ServiceValidationError(
          `Validation failed: ${messages}`,
          undefined,
          "SlideShowValidationError"
        );
      }
      throw new ServiceValidationError(
        "Invalid attachment data",
        undefined,
        "SlideShowValidationError"
      );
    }
  }
  validateDeattachGlobal(data: unknown) {
    try {
      return this.deattchGlobalSchema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.errors
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join(", ");
        throw new ServiceValidationError(
          `Validation failed: ${messages}`,
          undefined,
          "SlideShowValidationError"
        );
      }
      throw new ServiceValidationError(
        "Invalid attachment data",
        undefined,
        "SlideShowValidationError"
      );
    }
  }

  validateBulkAttach(data: unknown) {
    try {
      return this.bulkAttachSchema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.errors
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join(", ");
        throw new ServiceValidationError(
          `Validation failed: ${messages}`,
          undefined,
          "SlideShowValidationError"
        );
      }
      throw new ServiceValidationError(
        "Invalid bulk attachment data",
        undefined,
        "SlideShowValidationError"
      );
    }
  }

  validateBulkDeattach(data: unknown): deattachManyDTO {
    try {
      return this.bulkDeattachSchema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.errors
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join(", ");
        throw new ServiceValidationError(
          `Validation failed: ${messages}`,
          undefined,
          "SlideShowValidationError"
        );
      }
      throw new ServiceValidationError(
        "Invalid bulk attachment data",
        undefined,
        "SlideShowValidationError"
      );
    }
  }
  validCreateAndAttachManySchema(data: unknown) {
    try {
      const parsed = this.validateCreateAndAttachManySchema.parse(data);
      return parsed;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.errors
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join(", ");
        throw new ServiceValidationError(
          `Validation failed: ${messages}`,
          undefined,
          "SlideShowValidationError"
        );
      }
    }
  }

  validateReorder(data: unknown) {
    try {
      return this.reorderSchema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.errors
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join(", ");
        throw new ServiceValidationError(
          `Validation failed: ${messages}`,
          undefined,
          "SlideShowValidationError"
        );
      }
      throw new ServiceValidationError(
        "Invalid reorder data",
        undefined,
        "SlideShowValidationError"
      );
    }
  }

  validateId(id: string): string {
    const idSchema = z.string().cuid("Invalid slideshow ID format");
    try {
      return idSchema.parse(id);
    } catch (error) {
      throw new ServiceValidationError(
        "Invalid slideshow ID",
        undefined,
        "SlideShowValidationError"
      );
    }
  }

  validateSlug(slug: string): void {
    const slugSchema = z
      .string()
      .min(3)
      .max(100)
      .regex(
        /^[a-z0-9-]+$/,
        "Slug must contain only lowercase letters, numbers, and hyphens"
      );
    try {
      slugSchema.parse(slug);
    } catch (error) {
      throw new ServiceValidationError(
        "Invalid slug format",
        undefined,
        "SlideShowValidationError"
      );
    }
  }
}

// private attachServiceSchema = z.object({
//   slideShowId: z.string().cuid("Invalid slideshow ID"),
//   serviceId: z.string().cuid("Invalid service ID"),
//   order: z.number().int().min(0).default(0),
//   isVisible: z.boolean().default(true),
//   customTitle: z.string().max(200).optional(),
//   customDesc: z.string().max(500).optional(),
// });

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
