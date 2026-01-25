import { z } from "zod";
import { CreateServiceDTO, UpdateServiceDTO } from "../types/services";
import { ServiceValidationError } from "../errors/services.error";

export class ServicesValidator {
  private createSchema = z.object({
    name: z
      .string()
      .min(3, "Name must be at least 3 characters")
      .max(100, "Name must be less than 100 characters"),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters")
      .max(500, "Description must be less than 500 characters"),
    richDescription: z
      .string()
      .min(10, "Rich description must be at least 10 characters"),

    image: z.instanceof(Buffer).optional(),
    iconImage: z.instanceof(Buffer).optional(),

    icon: z.string().optional(),
    price: z.string().optional(),
    isActive: z.boolean().default(true),
    isFeatured: z.boolean().default(false),
    order: z.number().int().min(0).default(0),
  });

  private updateSchema = z.object({
    name: z.string().min(3).max(100).optional(),
    description: z.string().min(10).max(500).optional(),
    richDescription: z.string().min(10).optional(),
    image: z.instanceof(Buffer).optional().nullable(),
    imageState: z.enum(["KEEP", "REMOVE", "UPDATE"]).optional(),
    slug: z.string().optional(),

    icon: z.string().optional(),
    price: z.string().optional(),
    isActive: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    order: z.number().int().min(0).optional(),
  });

  validateCreate(data: unknown): CreateServiceDTO {
    try {
      return this.createSchema.parse(data);
    } catch (error : any) {
      if(error instanceof z.ZodError){
        throw new ServiceValidationError(error.issues[0].message);
      }
      throw new ServiceValidationError("Invalid service data");
    }
  }

  validateUpdate(data: unknown) {
    try {
      console.log(data);
      return this.updateSchema.parse(data);
    } catch (error) {
      throw new ServiceValidationError("Invalid update data");
    }
  }

  validateId(id: string): void {
    try {
      const idSchema = z.string().cuid("Invalid service ID format");
      idSchema.parse(id);
    } catch (error) {
      throw new ServiceValidationError("Invalid service ID");
    }
  }
  validateSlug(slug: string): void {
    if (!slug || typeof slug !== "string") {
      throw new ServiceValidationError("Invalid service slug");
    }
  }
}
