import { z } from "zod";

export const couponSchema = z.object({
  title: z.string().min(1),
  code: z.string().min(3).max(20).toUpperCase(),
  type: z.enum(["PERCENTAGE", "FIXED"]),
  discountValue: z.number().positive(),
  limit: z.union([z.number().positive(), z.literal("unlimited")]),
  count: z.number().default(0),
  minOrderValue: z.number().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  description: z.string().optional()
});
