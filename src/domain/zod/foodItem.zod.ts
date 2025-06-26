import { z } from "zod";
import { FoodType } from "../interfaces/utils.interface.js";

export const foodItemZodSchema = z.object({
  foodItemId: z.string().optional(),
  restaurantId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  price: z.number(),
  discountPrice: z.number().optional(),
  image: z.string().optional(),
  isAvailable: z.boolean().optional(),
  typeOfFood: z.array(z.nativeEnum(FoodType)),
  tags: z.array(z.string()).optional(),
  category: z.string(),
  rating: z.number().optional(),
  ratingCount: z.number().optional(),
  stock: z.number().optional(),
  addons: z.array(
    z.object({
      name: z.string(),
      price: z.number(),
    })
  ).optional(),
});

export type FoodItemInput = z.infer<typeof foodItemZodSchema>;
