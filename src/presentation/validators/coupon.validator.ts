import { z } from "zod";
import { couponSchema } from "../../domain/zod/coupon.zod.js";

// Full schema for creation
export const createCouponSchema = couponSchema;

// Partial schema for updates
export const updateCouponSchema = couponSchema.partial();

// Params validator for controller
export const couponIdParamsSchema = z.object({
  couponId: z.string().min(1, "couponId is required"),
});

// Array of couponIds
export const couponIdArraySchema = z.object({
  couponIds: z.array(
    couponIdParamsSchema.shape.couponId
  ).min(1, "At least one couponId is required"),
});

// Coupon code params (if validating by code)
export const couponCodeParamsSchema = z.object({
  code: z.string().min(1, "Coupon code is required").toUpperCase(),
});
