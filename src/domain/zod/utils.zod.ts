import { z } from "zod";

export const AddressSchema = z.object({
    lat: z.number().optional(),
    lng: z.number().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    no: z.string(),
    street: z.string(),
    area: z.string(),
    city: z.string(),
    state: z.string(),
    country: z.string(),
    pincode: z.string(),
    address: z.string(), // Full written address
    tag: z.string(), // home, office, others
});

// Create a refined version for order validation
export const OrderAddressSchema = AddressSchema.refine((data) => {
    // Ensure we have either lat/lng or latitude/longitude
    return (data.lat !== undefined && data.lng !== undefined) || 
           (data.latitude !== undefined && data.longitude !== undefined);
}, {
    message: "Either lat/lng or latitude/longitude must be provided"
});

export const fcmToken = z.object({
  token: z.string().min(1, "FCM token is required"),
  deviceName: z.string().min(1, "Device name is required"),
});
