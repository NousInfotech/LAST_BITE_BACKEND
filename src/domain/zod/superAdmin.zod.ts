import { z } from "zod";

// Basic login schema
export const superAdminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Full schema for creating a super admin by extending login schema
export const superAdminSchema = superAdminLoginSchema.extend({
  name: z.string().min(1),
  role: z.literal("superAdmin"), // Strictly enforce this
});
