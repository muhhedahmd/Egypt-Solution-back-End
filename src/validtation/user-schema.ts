



import { UserRole } from "@prisma/client";
import { z } from "zod";

export const userRegisterSchema = z.object({
    name: z.string().min(3, "name must be at least 3 characters")
    , email: z.string().email("email is not valid")
    , password: z.string().min(6, "password must be at least 6 characters"),
    role: z.enum(["",
        "ADMIN",
        "CUSTOMER",
        "GUEST",]).default(UserRole.ADMIN) ,
    isActive : z.boolean().default(true).optional(  ) 

});
