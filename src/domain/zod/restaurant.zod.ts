import { z } from "zod";
import { Days } from "../interfaces/utils.interface.js";
import { FoodType } from "../interfaces/utils.interface.js";

// GeoJSON‐style address
export const addressSchema = z.object({
  location: z.object({
    type: z.literal("Point"),
    coordinates: z
      .tuple([z.number(), z.number()])  // [ longitude, latitude ]
      .refine(([, lat]) => lat >= -90 && lat <= 90, {
        message: "Latitude must be between -90 and 90",
      })
      .refine(([lon]) => lon >= -180 && lon <= 180, {
        message: "Longitude must be between -180 and 180",
      }),
  }),
  no: z.string(),
  street: z.string(),
  area: z.string(),
  city: z.string(),
  state: z.string(),
  country: z.string(),
  fullAddress: z.string(),
  pincode: z.string(),
  tag: z.string().optional(),
});

export const documentSchema = z.object({
  panNumber: z.string(),
  panImage: z.string(),
  shopLicenseImage: z.string(),
  fssaiCertificateNumber: z.string(),
  fssaiCertificateImage: z.string(),
  gstinNumber: z.string(),
  gstCertificateImage: z.string(),
  cancelledChequeImage: z.string(),
  bankIFSC: z.string(),
  bankAccountNumber: z.string(),
  partnershipAgreement: z.string().optional(),
});

export const timingSchema = z.object({
  day: z.nativeEnum(Days),
  shifts: z.array(
    z.object({
      start: z.string(),  // "HH:mm"
      end: z.string(),
    })
  ),
});

export const restaurantSchema = z.object({
  restaurantName: z.string(),
  address: addressSchema,
  documents: documentSchema,
  timings: z.array(timingSchema).min(1), // Changed to require at least 1 day
  tags: z.array(z.string()),
  cuisines: z.array(z.string()).optional(),
  typeOfFood: z.array(z.string()), // Changed from z.nativeEnum(FoodType) to z.string() for flexibility
  profilePhoto: z.string().optional(),
  menuImages: z.array(z.string()),
  isActive: z.boolean().optional(),
  availableCategories: z.array(z.string()),
  rating: z.number().min(1).max(5).default(3.5).optional(),
  packagingCharges: z.number().default(0).optional(),
});
