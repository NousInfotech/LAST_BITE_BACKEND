import { z } from "zod";
import { AddressSchema } from "./utils.zod.js";

export const RiderSchema = z.object({
    riderId: z.string().uuid(),
    name: z.string().min(1),
    phoneNumber: z.string().regex(/^\+91\d{10}$/, "Invalid Indian phone number"),
    email: z.string().email().optional(),
    dateOfBirth: z.string().optional(),
    address: AddressSchema.optional(),
    vehicleType: z.enum(["bike", "scooter", "car"]),
    vehicleNumber: z.string().optional(),
    licenseNumber: z.string().optional(),
    aadharNumber: z.string().optional(),
    profilePhoto: z.string().optional(),
    documentProofs: z.array(z.string()).optional(),
    isVerified: z.boolean().optional(),
    isAvailable: z.boolean().optional(),
    lastLocation: z
        .object({
            lat: z.number(),
            lng: z.number(),
        })
        .optional(),
});
