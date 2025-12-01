import { z } from "zod";
import { ContactCreationError, ContactError, ContactUpdateError, ContactValidationError } from "../contact.error";


export class ZodValidationError extends ContactValidationError {
  constructor(
    public errors: z.ZodError,
    message?: string
  ) {
    const errorMessage =
      message ||
      `Validation failed: ${errors.errors
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join(", ")}`;
    super(errorMessage, "ZOD_VALIDATION_ERROR", "ZodValidationError");
  }

  getFormattedErrors() {
    return this.errors.errors.reduce(
      (acc, error) => {
        const path = error.path.join(".");
        acc[path] = error.message;
        return acc;
      },
      {} as Record<string, string>
    );
  }
}

export class ContactValidator {
  private paginationSchema() {
    return z.object({
      skip: z.number().int().min(0).optional().default(0),
      take: z.number().int().min(1).max(100).optional().default(10),
    });
  }

  private createContactSchema() {

    

    return z.object({
      name: z.string().min(1, "Name is required").max(255),
      email: z.string().email("Invalid email address"),
      phone: z
        .string()
        .regex(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, "Invalid phone number format")
        
        .nullable(),
      company: z.string().min(1, "Company name must not be empty").max(255).nullable(),
      subject: z.string().min(1, "Subject is required").max(255),
      message: z.string().min(10, "Message must be at least 10 characters").max(5000),
      category: z
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
      serviceId: z.string().cuid("Invalid service ID format").nullable(),
      budget: z.string().min(1, "Budget must not be empty").max(255).default("").nullable(),
      timeline: z.string().min(1, "Timeline must not be empty").max(255).default("").nullable(),
      status: z.enum(["NEW", "READ", "IN_PROGRESS", "RESOLVED", "CLOSED"]) .default("NEW"),
      priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
      ipAddress: z.string().default("").nullable(),
      userAgent: z.string().default("").nullable(),
      source: z.string().max(255).default("").nullable(),
      referrer: z.string().url("Invalid referrer URL").default("").nullable(),
    });
  }

  private updateContactSchema() {
    return z.object({
      status: z.enum(["NEW", "READ", "IN_PROGRESS", "RESOLVED", "CLOSED"]).optional(),
      priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
      notes: z.string().max(5000).optional().nullable(),
      response: z.string().max(5000).optional().nullable(),
      resolved: z.boolean().optional(),
      respondedBy: z.string().optional().nullable(),
      respondedAt: z.date().optional().nullable(),
    });
  }

  paginationParamsValidation(params: unknown) {
    try {
      const parsed = this.paginationSchema().safeParse(params);
      if (!parsed.success) {
        throw new ZodValidationError(
          parsed.error,
          "Invalid pagination parameters"
        );
      }
      return parsed.data;
    } catch (error) {
      if (error instanceof ContactError) {
        throw error;
      }
      throw new ContactValidationError("Invalid pagination parameters");
    }
  }

  createContactValidation(data: unknown) {
    try {
      const schema = this.createContactSchema();
      const parsed = schema.safeParse(data);
      
      if (!parsed.success) {
        throw new ZodValidationError(parsed.error, "Failed to validate contact data");
      }
      
      return parsed.data;
    } catch (error) {
      if (error instanceof ContactError) {
        throw error;
      }
      if (error instanceof z.ZodError) {
        throw new ZodValidationError(error);
      }
      throw new ContactCreationError("Failed to validate contact data");
    }
  }

  updateContactValidation(data: unknown) {
    try {
      const schema = this.updateContactSchema();
      const parsed = schema.safeParse(data);
      
      if (!parsed.success) {
        throw new ZodValidationError(parsed.error, "Failed to validate update data");
      }
      
      return parsed.data;
    } catch (error) {
      if (error instanceof ContactError) {
        throw error;
      }
      if (error instanceof z.ZodError) {
        throw new ZodValidationError(error);
      }
      throw new ContactUpdateError("Failed to validate update data");
    }
  }

  validateContactId(id: unknown) {
    try {
      const schema = z.string().cuid("Invalid contact ID format");
      const parsed = schema.safeParse(id);
      
      if (!parsed.success) {
        throw new ZodValidationError(parsed.error, "Invalid contact ID");
      }
      
      return parsed.data;
    } catch (error) {
      if (error instanceof ContactError) {
        throw error;
      }
      throw new ContactValidationError("Invalid contact ID format");
    }
  }

  validateEmail(email: unknown) {
    try {
      const schema = z.string().email("Invalid email format");
      const parsed = schema.safeParse(email);
      
      if (!parsed.success) {
        throw new ZodValidationError(parsed.error, "Invalid email");
      }
      
      return parsed.data;
    } catch (error) {
      if (error instanceof ContactError) {
        throw error;
      }
      throw new ContactValidationError("Invalid email format");
    }
  }

  validateBulkIds(ids: unknown) {
    try {
      const schema = z.array(z.string().cuid("Invalid ID format"));
      const parsed = schema.safeParse(ids);
      
      if (!parsed.success) {
        throw new ZodValidationError(parsed.error, "Invalid IDs in list");
      }
      
      return parsed.data;
    } catch (error) {
      if (error instanceof ContactError) {
        throw error;
      }
      throw new ContactValidationError("Invalid IDs in list");
    }
  }

  validateStatus(status: unknown) {
    try {
      const schema = z.enum(["NEW", "READ", "IN_PROGRESS", "RESOLVED", "CLOSED"]);
      const parsed = schema.safeParse(status);
      
      if (!parsed.success) {
        throw new ZodValidationError(parsed.error, "Invalid contact status");
      }
      
      return parsed.data;
    } catch (error) {
      if (error instanceof ContactError) {
        throw error;
      }
      throw new ContactValidationError("Invalid contact status");
    }
  }

  validatePriority(priority: unknown) {
    try {
      const schema = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);
      const parsed = schema.safeParse(priority);
      
      if (!parsed.success) {
        throw new ZodValidationError(parsed.error, "Invalid priority level");
      }
      
      return parsed.data;
    } catch (error) {
      if (error instanceof ContactError) {
        throw error;
      }
      throw new ContactValidationError("Invalid priority level");
    }
  }

  validateCategory(category: unknown) {
    try {
      const schema = z.enum([
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
    } catch (error) {
      if (error instanceof ContactError) {
        throw error;
      }
      throw new ContactValidationError("Invalid contact category");
    }
  }
}