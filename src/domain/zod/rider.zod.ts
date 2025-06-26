
import { z } from "zod";
import { AddressSchema } from "./utils.zod.js";

export const RiderDocumentsSchema = z.object({
    vehicle: z.object({
        vehicleNumber: z.string(),
        license: z.object({
            number: z.string(),
            image: z.string().url()
        }),
        rc: z.object({
            number: z.string(),
            images: z.array(z.string().url()).min(1)
        }),
        insurance: z.object({
            number: z.string(),
            image: z.string().url()
        })
    }),
    identification: z.object({
        aadharNumber: z.string().length(12, "Aadhaar must be 12 digits"),
        aadharImage: z.string().url(),
        panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN number"),
        panImage: z.string().url()
    }),
    banking: z.object({
        accountNumber: z.string().min(9),
        ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code"),
        passbookImage: z.string().url()
    })
});


export const RiderSchema = z.object({
    name: z.string().min(1),
    phoneNumber: z.string().regex(/^\+91\d{10}$/, "Invalid Indian phone number"),
    email: z.string().email().optional(),
    dateOfBirth: z.string().optional(),
    address: AddressSchema.extend({
        latitude: z.number().optional(),
        longitude: z.number().optional(),
    }).optional(),
    vehicleType: z.enum(["bike", "scooter", "electric-vehicle"]),
    profilePhoto: z.string().url().optional(),

    documents: RiderDocumentsSchema, // ✅ nested schema here

    isVerified: z.boolean().optional(),
    isAvailable: z.boolean().optional(),
    lastLocation: z
        .object({
            lat: z.number(),
            lng: z.number(),
        })
        .optional(),
});
