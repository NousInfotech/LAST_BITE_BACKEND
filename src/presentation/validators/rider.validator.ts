import { z } from "zod";
import { RiderSchema } from "../../domain/zod/rider.zod.js";

// Create Rider Schema
export const riderSchema = RiderSchema;

// Update Rider Schema - all fields optional
export const updateRiderSchema = RiderSchema.partial();

// Params for RiderController
export const riderIdParamsSchema = z.object({
  riderId: z.string().min(1, "riderId is required")
});
