import { z } from "zod";


export const storeInitSchema = z.object({
  storeName: z.string().min(1, "Store name is required"),
  storeDescription: z.string().nullable(),
  allowGuestCheckout: z.boolean().optional().default(true),
  requireEmailVerification: z.boolean().optional().default(false),
  currency: z.string().default("USD"),
  timezone: z.string().default("UTC"),
  metaTitle: z.string().min(3, "Meta title is required").optional(),
  metaDescription: z.string().min(1, "Meta description is required").optional(),
  email: z.string().email("Invalid email"),
  phone: z.string().min(5, "Phone is too short"),
  address: z.string().min(2 , "Address is too short").optional(),
  city: z.string().min(2 , "City is too short").optional(),
  state: z.string().min(2 , "state is too short").optional(),
  country: z.string().min(2 , "country:  is too short").optional(),
  postalCode: z.string().min(2 , "postalCode is too short").optional(),
  logo: z.any().nullable(), // or refine if you want to check it's File
});