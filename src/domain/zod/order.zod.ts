import { z } from "zod";

// Only for COD:
export const CodOrderInput = z.object({
  items: z.array(z.object({
    foodItemId: z.string().min(1),
    quantity: z.number().min(1),
  })),
  userId: z.string().min(1),
  restaurantId: z.string().min(1),
  paymentType: z.literal("COD"),
  notes: z.object({
    location: z.object({
      lat: z.number(),
      lng: z.number(),
    }),
  }).optional(),
});
