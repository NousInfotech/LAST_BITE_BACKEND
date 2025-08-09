import { ICoupon } from "../../domain/interfaces/coupon.interface.js";
import { CouponRepository } from "../../infrastructure/repositories/coupon.repository.js";
import { sendUserNotification } from "../../presentation/sockets/userNotification.socket.js";
import { sendRestaurantNotification } from "../../presentation/sockets/restaurantNotification.socket.js";

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

        const created = await couponRepo.createCoupon(payload);
        try {
            // Broadcast to all users (example: leave filtering to API clients)
            sendUserNotification("all", {
                type: 'promo',
                targetRole: 'user',
                targetRoleId: 'all',
                message: `New coupon ${created.code} is available`,
                emoji: '🎟️',
                theme: 'success',
                metadata: { couponId: created.couponId, code: created.code }
            } as any);
        } catch {}
        return created;
    },


    // Get coupon by custom couponId
    getCouponById: (couponId: string) => couponRepo.findByCouponId(couponId),

    // Get coupon by code
    getCouponByCode: (code: string) => couponRepo.findByCode(code),

    // Update coupon
    updateCoupon: async (couponId: string, data: Partial<ICoupon>) => {
        const updated = await couponRepo.updateCoupon(couponId, data);
        try {
            sendUserNotification("all", {
                type: 'promo',
                targetRole: 'user',
                targetRoleId: 'all',
                message: `Coupon updated: ${updated?.code ?? couponId}`,
                emoji: '🛠️',
                theme: 'info',
                metadata: { couponId }
            } as any);
        } catch {}
        return updated;
    },

    // Delete coupon
    deleteCoupon: (couponId: string) => couponRepo.deleteCoupon(couponId),

    // Get all coupons (with optional filter)
    getAllCoupons: (filter: Partial<ICoupon> = {}) => couponRepo.getAllCoupons(filter),

    // Increment coupon usage count (e.g., when redeemed)
    incrementCouponUsage: (couponId: string) => couponRepo.incrementUsage(couponId),

    // Deactivate coupon (e.g., admin action)
    deactivateCoupon: async (couponId: string) => {
        const res = await couponRepo.deactivateCoupon(couponId);
        try {
            sendUserNotification("all", {
                type: 'promo',
                targetRole: 'user',
                targetRoleId: 'all',
                message: `A coupon was deactivated`,
                emoji: '🚫',
                theme: 'warning',
                metadata: { couponId }
            } as any);
        } catch {}
        return res;
    },
};
