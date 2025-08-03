import { z } from "zod";
import { MartStoreAdminSchema } from "../../domain/zod/martStoreAdmin.zod.js";

// Create Admin Schema
export const adminSchema = MartStoreAdminSchema;

// Update Admin Schema - all fields optional
export const updateAdminSchema = MartStoreAdminSchema.partial();

// Params for MartStoreAdminController
export const adminIdParamsSchema = z.object({
  adminId: z.string().min(1, "adminId is required")
});
