import { z } from "zod";
import { MartProductSchema } from "../../domain/zod/martProduct.zod.js";

// Full schema for creation
export const martProductSchema = MartProductSchema;

// Partial schema for updates
export const updateMartProductSchema = martProductSchema.partial();

// Params validator for controller
export const martProductIdParamsSchema = z.object({
    martProductId: z.string().min(1, "martProductId is required"),
});

export const martProductIdArraySchema = z.object({
    martProductIds: z.array(
        martProductIdParamsSchema.shape.martProductId
    ).min(1, "At least one martProduct is required"),
});

