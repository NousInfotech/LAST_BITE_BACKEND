import { z } from "zod";
import { foodItemZodSchema } from "../../domain/zod/foodItem.zod.js";

// Full schema for creation
export const foodItemSchema = foodItemZodSchema;

// Partial schema for updates
export const updateFoodItemSchema = foodItemSchema.partial();

// Params validator for controller
export const foodItemIdParamsSchema = z.object({
  foodItemId: z.string().min(1, "foodItemId is required"),
});
