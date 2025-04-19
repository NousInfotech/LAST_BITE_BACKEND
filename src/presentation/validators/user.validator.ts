import { z } from "zod";
import { userSchema } from "../../domain/zod/user.zod.js";
import { AddressSchema } from "../../domain/zod/utils.zod.js";


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


