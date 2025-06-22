import { z } from 'zod'
import { restaurantSchema } from '../../domain/zod/restaurant.zod.js';

export const updateRestaurantSchema = restaurantSchema.partial();


export const restaurantIdSchema = z.object({
    restaurantId: z.string().min(1, "restaurantId is required"),
});

export const restaurantIdArraySchema = z.object({
    restaurantIds: z.array(
        restaurantIdSchema.shape.restaurantId
    ).min(1, "At least one restaurantId is required"),
});
