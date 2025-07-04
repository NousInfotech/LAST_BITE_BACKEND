import { z } from 'zod'
import { restaurantSchema } from '../../domain/zod/restaurant.zod.js';
import { RestaurantStatusEnum } from '../../domain/interfaces/utils.interface.js';

export const updateRestaurantSchema = restaurantSchema.partial();


export const restaurantIdSchema = z.object({
    restaurantId: z.string().min(1, "restaurantId is required"),
});

export const restaurantIdArraySchema = z.object({
    restaurantIds: z.array(
        restaurantIdSchema.shape.restaurantId
    ).min(1, "At least one restaurantId is required"),
});

export const restaurantStatusSchema = z.object({
    status: z.nativeEnum(RestaurantStatusEnum).default(RestaurantStatusEnum.PENDING),
    message: z.string().optional(), // Reason for rejection, suspension, etc.
    days: z.number().optional(),
}).superRefine((data, ctx) => {
    if (data.status === RestaurantStatusEnum.SUSPENDED && (data.days === undefined || data.days <= 0)) {
        ctx.addIssue({
            path: ['days'],
            code: z.ZodIssueCode.custom,
            message: "Suspended status requires a valid number of suspension days",
        });
    }

    if (data.status !== RestaurantStatusEnum.SUSPENDED && data.days !== undefined) {
        ctx.addIssue({
            path: ['days'],
            code: z.ZodIssueCode.custom,
            message: "Only suspended status should include suspension days",
        });
    }
});

