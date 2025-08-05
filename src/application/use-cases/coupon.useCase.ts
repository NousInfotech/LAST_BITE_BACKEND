import { ICoupon } from "../../domain/interfaces/coupon.interface.js";
import { CouponRepository } from "../../infrastructure/repositories/coupon.repository.js";

const couponRepo = new CouponRepository();

export const CouponUseCase = {
    // Create a coupon
    createCoupon: async (data: Omit<ICoupon, "isActive">) => {
        const payload: ICoupon = {
            ...data,
            isActive: false
        };

        payload.code = payload.code.toUpperCase();

        const existing = await couponRepo.findByCode(payload.code);
        if (existing) {
            throw new Error(`Coupon with code "${payload.code}" already exists.`);
        }

        return await couponRepo.createCoupon(payload);
    },


    // Get coupon by custom couponId
    getCouponById: (couponId: string) => couponRepo.findByCouponId(couponId),

    // Get coupon by code
    getCouponByCode: (code: string) => couponRepo.findByCode(code),

    // Update coupon
    updateCoupon: (couponId: string, data: Partial<ICoupon>) =>
        couponRepo.updateCoupon(couponId, data),

    // Delete coupon
    deleteCoupon: (couponId: string) => couponRepo.deleteCoupon(couponId),

    // Get all coupons (with optional filter)
    getAllCoupons: (filter: Partial<ICoupon> = {}) => couponRepo.getAllCoupons(filter),

    // Increment coupon usage count (e.g., when redeemed)
    incrementCouponUsage: (couponId: string) => couponRepo.incrementUsage(couponId),

    // Deactivate coupon (e.g., admin action)
    deactivateCoupon: (couponId: string) => couponRepo.deactivateCoupon(couponId),
};
