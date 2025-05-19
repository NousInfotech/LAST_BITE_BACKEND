import { z } from 'zod'
import { restaurantSchema } from '../../domain/zod/restaurant.zod.js';

export const updateRestaurantSchema = restaurantSchema.partial();


export const restaurantIdSchema = z.object({
    restaurantId: z.string().min(1, "restaurantId is required"),
});