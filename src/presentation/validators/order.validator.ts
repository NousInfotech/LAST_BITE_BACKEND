import { z } from "zod";
import { CodOrderInput } from "../../domain/zod/order.zod.js";

export const RazorpayOrderInput = z.object({
  items: z.array(z.object({
    foodItemId: z.string().min(1),
    quantity: z.number().min(1),
    additionals: z.array(z.any()).optional(),
  })),
  restaurantId: z.string().min(1),
  notes: z.object({
    location: z.object({
      lat: z.number(),
      lng: z.number(),
    }),
  }),
  paymentType: z.literal("ONLINE"),
});

export const RazorpayVerifyInput = z.object({
  orderId: z.string().min(1),
  paymentId: z.string().min(1),
  signature: z.string().min(1),
  notes: RazorpayOrderInput,
});

export { CodOrderInput }; 