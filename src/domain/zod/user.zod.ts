// src/domain/zod/user.schema.ts
import { z } from "zod";
import { AddressSchema } from "./utils.zod.js";

export const userSchema = z.object({
    name: z.string().min(1, "Name is required"),
    phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
    email: z.string().email("Invalid email").optional(),
    profileImage: z.string().optional(),
    addresses: z.array(AddressSchema).optional(),
});

