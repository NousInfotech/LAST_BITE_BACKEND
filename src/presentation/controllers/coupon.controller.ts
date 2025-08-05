import { Request, Response } from "express";
import { validate } from "../../utils/validation.js";
import { tryCatch } from "../../utils/tryCatch.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { sendError } from "../../utils/sendError.js";
import { HTTP } from "../../utils/constants.js";
import { CouponUseCase } from "../../application/use-cases/coupon.useCase.js";
import {
    createCouponSchema,
    updateCouponSchema,
    couponIdParamsSchema,
    couponIdArraySchema,
    couponCodeParamsSchema
} from "../validators/coupon.validator.js";

export const CouponController = {
    async createCoupon(req: Request, res: Response) {
        const validated = validate(createCouponSchema, req.body, res);
        if (!validated) return;

        return tryCatch(res, async () => {
            const coupon = await CouponUseCase.createCoupon(validated);
            return sendResponse(res, HTTP.CREATED, "Coupon created successfully", coupon);
        });
    },

    async getCouponById(req: Request, res: Response) {
        const parsed = validate(couponIdParamsSchema, req.params, res);
        if (!parsed) return;

        const { couponId } = parsed;

        return tryCatch(res, async () => {
            const coupon = await CouponUseCase.getCouponById(couponId);
            if (!coupon) return sendError(res, HTTP.NOT_FOUND, "Coupon not found");
            return sendResponse(res, HTTP.OK, "Coupon fetched successfully", coupon);
        });
    },

    async getCouponByCode(req: Request, res: Response) {
        const parsed = validate(couponCodeParamsSchema, req.params, res);
        if (!parsed) return;

        const { code } = parsed;

        return tryCatch(res, async () => {
            const coupon = await CouponUseCase.getCouponByCode(code);
            if (!coupon) return sendError(res, HTTP.NOT_FOUND, "Coupon not found");
            return sendResponse(res, HTTP.OK, "Coupon fetched successfully", coupon);
        });
    },

    async updateCoupon(req: Request, res: Response) {
        const paramCheck = validate(couponIdParamsSchema, req.params, res);
        if (!paramCheck) return;

        const bodyCheck = validate(updateCouponSchema, req.body, res);
        if (!bodyCheck) return;

        const { couponId } = paramCheck;

        return tryCatch(res, async () => {
            const updated = await CouponUseCase.updateCoupon(couponId, bodyCheck);
            if (!updated) return sendError(res, HTTP.NOT_FOUND, "Coupon not found");
            return sendResponse(res, HTTP.OK, "Coupon updated successfully", updated);
        });
    },

    async deleteCoupon(req: Request, res: Response) {
        const parsed = validate(couponIdParamsSchema, req.params, res);
        if (!parsed) return;

        const { couponId } = parsed;

        return tryCatch(res, async () => {
            const deleted = await CouponUseCase.deleteCoupon(couponId);
            if (!deleted) return sendError(res, HTTP.NOT_FOUND, "Coupon not found");
            return sendResponse(res, HTTP.OK, "Coupon deleted successfully", deleted);
        });
    },

    async getAllCoupons(req: Request, res: Response) {
        const filters = req.query;
        return tryCatch(res, async () => {
            const coupons = await CouponUseCase.getAllCoupons(filters);
            if (!coupons || coupons.length === 0) {
                return sendError(res, HTTP.NOT_FOUND, "Coupons not found");
            }
            return sendResponse(res, HTTP.OK, "Coupons fetched successfully", coupons);
        });
    },

    async bulkGetByCouponIds(req: Request, res: Response) {
        const bodyCheck = validate(couponIdArraySchema, req.body, res);
        if (!bodyCheck) return;

        const { couponIds } = bodyCheck;

        return tryCatch(res, async () => {
            const coupons = await Promise.all(
                couponIds.map((id) => CouponUseCase.getCouponById(id))
            );
            const validCoupons = coupons.filter(Boolean);

            if (validCoupons.length === 0) {
                return sendError(res, HTTP.NOT_FOUND, "No coupons found");
            }

            return sendResponse(res, HTTP.OK, "Coupons fetched successfully", validCoupons);
        });
    }
};
