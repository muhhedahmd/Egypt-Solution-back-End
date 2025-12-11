"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeInitSchema = void 0;
const zod_1 = require("zod");
exports.storeInitSchema = zod_1.z.object({
    storeName: zod_1.z.string().min(1, "Store name is required"),
    storeDescription: zod_1.z.string().nullable(),
    allowGuestCheckout: zod_1.z.boolean().optional().default(true),
    requireEmailVerification: zod_1.z.boolean().optional().default(false),
    currency: zod_1.z.string().default("USD"),
    timezone: zod_1.z.string().default("UTC"),
    metaTitle: zod_1.z.string().min(3, "Meta title is required").optional(),
    metaDescription: zod_1.z.string().min(1, "Meta description is required").optional(),
    email: zod_1.z.string().email("Invalid email"),
    phone: zod_1.z.string().min(5, "Phone is too short"),
    address: zod_1.z.string().min(2, "Address is too short").optional(),
    city: zod_1.z.string().min(2, "City is too short").optional(),
    state: zod_1.z.string().min(2, "state is too short").optional(),
    country: zod_1.z.string().min(2, "country:  is too short").optional(),
    postalCode: zod_1.z.string().min(2, "postalCode is too short").optional(),
    logo: zod_1.z.any().nullable(), // or refine if you want to check it's File
});
