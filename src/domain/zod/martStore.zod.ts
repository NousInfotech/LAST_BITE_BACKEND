import { z } from "zod";
import { RestaurantStatusEnum } from "../interfaces/utils.interface.js";
import { addressSchema } from "./restaurant.zod.js";

export const MartDocumentsSchema = z.object({
    gstinNumber: z.string(),
    gstCertificateImage: z.string(),
    tradeLicenseNumber: z.string().optional(),
    tradeLicenseImage: z.string().optional(),
    cancelledChequeImage: z.string().optional(),
    bankIFSC: z.string(),
    bankAccountNumber: z.string(),
});

export const MartStoreStatusSchema = z.object({
    status: z.nativeEnum(RestaurantStatusEnum),
    message: z.string().optional(),
    days: z.number().optional(),
    updatedAt: z.union([z.string(), z.date()]).optional(),
});

export const MartStoreSchema = z.object({
    martStoreName: z.string(),
    address: addressSchema,
    documents: MartDocumentsSchema,
    isAvailable: z.boolean(),
    storeStatus: MartStoreStatusSchema.optional(),
    packagingCharges: z.number().optional(),
    tags: z.array(z.string()).optional(),
    storeLogo: z.string().optional(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
});
