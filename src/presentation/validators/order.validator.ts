import { z } from "zod";
import { IOrderStatusEnum } from "../../domain/interfaces/order.interface.js";

export const OrderCreateSchema = z.object({
  items: z.array(z.object({
    foodItemId: z.string().min(1),
    quantity: z.number().min(1),
    additionals: z.array(z.any()).optional(),
  })),
  userId: z.string().min(1),
  restaurantId: z.string().min(1),
  orderNotes: z.string().optional(),
  location: z.object({
    dropoff: z.object({
      lat: z.number(),
      lng: z.number(),
    }),
  }),
});


export const OrderVerifySchema = z.object({
  orderId: z.string().min(1),
  paymentId: z.string().min(1),
  signature: z.string().min(1),
});

export const OrderStatusUpdateSchema = z.object({
  orderId: z.string().min(1),
  status: z.nativeEnum(IOrderStatusEnum)
});

export const OrderFeedbackSchema = z.object({
  orderRating: z.number(),
  riderRating: z.number().optional(),
  review: z.string().optional()
})