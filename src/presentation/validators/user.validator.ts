import { z } from "zod";
import { userCartSchema, userCollectionSchema, userSchema } from "../../domain/zod/user.zod.js";
import { AddressSchema } from "../../domain/zod/utils.zod.js";
import { FavoritesActions } from "../../domain/interfaces/utils.interface.js";
import { AnonymizeContextImpl } from "twilio/lib/rest/video/v1/room/participant/anonymize.js";


// Schema for updating a user
export const updateUserSchema = userSchema.partial();

// Schema for adding a new address
export const addressSchema = AddressSchema;

// Schema for updating an address (all fields optional)
export const updateAddressSchema = AddressSchema.partial();

// Schema for userController Params

export const userIdSchema = z.object({
    userId: z.string().min(1, "userId is required")
});

export const addressIdSchema = z.object({
    userId: z.string().min(1, "userId is required"),
    addressId: z.string().min(1, "addressId is required")
});

export const favoriteValidator = z.object({
    favourites: z.object({
        restaurants: z.array(z.string()).optional(), // allow array or undefined
        foodItems: z.array(z.string()).optional(),
    }),
    action: z.nativeEnum(FavoritesActions),
});

export const blockedRestaurantsValidator = z.object({
    restaurantId: z.string(),
    issueDescription: z.string().optional(),
    action: z.nativeEnum(FavoritesActions),
})

export const cartValidator = z.array(userCartSchema);


