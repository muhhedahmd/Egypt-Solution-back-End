"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRegisterSchema = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
exports.userRegisterSchema = zod_1.z.object({
    name: zod_1.z.string().min(3, "name must be at least 3 characters"),
    email: zod_1.z.string().email("email is not valid"),
    password: zod_1.z.string().min(6, "password must be at least 6 characters"),
    role: zod_1.z.enum(["ADMIN", "EDITOR", "VIEWER"]).default(client_1.UserRole.ADMIN),
    isActive: zod_1.z.boolean().default(true).optional(),
});
