import { skip } from "node:test";
import { z } from "zod";
import { ContactValidationError } from "../contact.error";

export class contactValidatior {
  private paramsSchema() {
    return z.object({
      skip: z.number().optional().default(0),
      take: z.number().optional().default(10),
    });
  }

  pagnitionParmsValidation(params: unknown) {
    try {
      const parsed = this.paramsSchema().safeParse(params);
      if (!parsed.success) {
        throw new Error(parsed.error.message);
      }
      return parsed.data;
    } catch (error) {
      throw new ContactValidationError("Invalid pagination parameters");
    }
  }
}
