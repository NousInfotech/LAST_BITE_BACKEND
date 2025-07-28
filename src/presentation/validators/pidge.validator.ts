import { z } from "zod";

export const PidgeCoordinatesSchema = z.object({
  latitude: z.number().refine((val) => Math.abs(val) <= 90, {
    message: "Latitude must be between -90 and 90",
  }),
  longitude: z.number().refine((val) => Math.abs(val) <= 180, {
    message: "Longitude must be between -180 and 180",
  }),
});

export const GetPidgeQuoteSchema = z.object({
  pickup: z.object({
    coordinates: PidgeCoordinatesSchema,
    pincode: z.string().min(4, "Pickup pincode must be at least 4 characters long"),
  }),
  drop: z
    .array(
      z.object({
        ref: z.string().min(1, "Reference ID is required"),
        location: z.object({
          coordinates: PidgeCoordinatesSchema,
          pincode: z.string().min(4, "Drop pincode must be at least 4 characters long"),
        }),
        attributes: z.object({
          cod_amount: z.number().min(0, "COD amount must be >= 0"),
          weight: z.number().min(0.01, "Weight must be > 0"),
          volumetric_weight: z.number().min(0, "Volumetric weight must be >= 0"),
        }).optional(),
      })
    )
    .min(1, "At least one drop location is required"),
});
