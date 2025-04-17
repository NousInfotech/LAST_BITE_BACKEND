import { z } from "zod";

export const addressSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  no: z.string(),
  street: z.string(),
  area: z.string(),
  city: z.string(),
  state: z.string(),
  country: z.string(),
  fullAddress: z.string(),
  tag: z.enum(["home", "office", "friends", "others"]).optional(),
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
});

export const timingSchema = z.object({
  day: z.string(),
  shifts: z.array(z.object({
    start: z.string(),
    end: z.string(),
  })),
});

export const restaurantSchema = z.object({
  restaurantName: z.string(),
  address: addressSchema,
  documents: documentSchema,
  timings: z.array(timingSchema),
  tags: z.array(z.string()),
  cuisines: z.array(z.string()).optional(),
  typeOfFood: z.string().optional(),
  profilePhoto: z.string().optional(),
  isActive: z.boolean().optional(),
});