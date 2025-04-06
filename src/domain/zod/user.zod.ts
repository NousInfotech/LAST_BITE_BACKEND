// src/domain/zod/user.schema.ts
import { z } from "zod";

export const userAddressSchema = z.object({
    latitude: z.number(),
    longitude: z.number(),
    no: z.string(),
    street: z.string(),
    area: z.string().optional(),
    city: z.string(),
    state: z.string(),
    country: z.string(),
    address: z.string(), // Full written address
    tag: z.string(), // home, office, others
});

export const userSchema = z.object({
    name: z.string().min(1, "Name is required"),
    phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
    email: z.string().email("Invalid email").optional(),
    firebaseId: z.string().min(1, "Firebase ID is required").optional(),
    profileImage: z.string().optional(),
    addresses: z.array(userAddressSchema).optional(),
});
