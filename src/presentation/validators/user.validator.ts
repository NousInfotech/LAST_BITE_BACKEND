import { z } from "zod";
import { userAddressSchema, userSchema } from "../../domain/zod/user.zod.js";


// Schema for creating a user (require firebaseId)
export const createUserSchema = userSchema.extend({
    firebaseId: z.string().min(1, "Firebase ID is required"),
});

// Schema for updating a user (firebaseId optional)
export const updateUserSchema = userSchema.partial();

// Schema for adding a new address
export const addressSchema = userAddressSchema;

// Schema for updating an address (all fields optional)
export const updateAddressSchema = userAddressSchema.partial();

// Schema for userController Params

export const userIdParamsSchema = z.object({
    userId: z.string().min(1, "userId is required")
});

export const firebaseIdParamsSchema = z.object({
    firebaseId: z.string().min(1, "firebaseId is required")
});


