"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactValidatior = void 0;
const zod_1 = require("zod");
const contact_error_1 = require("../contact.error");
class contactValidatior {
    paramsSchema() {
        return zod_1.z.object({
            skip: zod_1.z.number().optional().default(0),
            take: zod_1.z.number().optional().default(10),
        });
    }
    pagnitionParmsValidation(params) {
        try {
            const parsed = this.paramsSchema().safeParse(params);
            if (!parsed.success) {
                throw new Error(parsed.error.message);
            }
            return parsed.data;
        }
        catch (error) {
            throw new contact_error_1.ContactValidationError("Invalid pagination parameters");
        }
    }
}
exports.contactValidatior = contactValidatior;
