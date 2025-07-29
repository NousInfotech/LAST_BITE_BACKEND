// src/validators/martProduct.zod.ts

import { z } from "zod";

export const MartProductSchema = z.object({
    productName: z.string(),
    martStoreId: z.string(),
    description: z.string().optional(),
    price: z.number(), // inclusive of GST
    discountPrice: z.number().optional(),
    image: z.string().url().optional(),
    isAvailable: z.boolean(),
    unit: z.string(), // e.g., "1kg", "500g", etc.
    categories: z.array(z.string()),
    stock: z.number().optional(),
    rating: z.number().min(0).max(5).optional(),
    ratingCount: z.number().int().nonnegative().optional(),
    tags: z.array(z.string()).optional(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
});

export type MartProductInput = z.infer<typeof MartProductSchema>;
