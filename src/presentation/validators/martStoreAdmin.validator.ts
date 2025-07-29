import { z } from "zod";
import { RestaurantAdminSchema } from "../../domain/zod/restaurantAdmin.zod.js";

// Create Admin Schema
export const adminSchema = RestaurantAdminSchema;

// Update Admin Schema - all fields optional
export const updateAdminSchema = RestaurantAdminSchema.partial();

// Params for RestaurantAdminController
export const adminIdParamsSchema = z.object({
  adminId: z.string().min(1, "adminId is required")
});
