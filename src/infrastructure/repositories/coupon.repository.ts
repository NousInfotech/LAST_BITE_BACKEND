import { FilterQuery, UpdateQuery } from "mongoose";
import { ICoupon } from "../../domain/interfaces/coupon.interface.js";
import { CouponModel, ICouponDoc } from "../db/mongoose/schemas/coupon.schema.js";
import { extractQueryOptions } from "../db/helper/utils.helper.js";

export class CouponRepository {
    async createCoupon(coupon: ICoupon) {
        const newCoupon = new CouponModel(coupon);
        return await newCoupon.save();
    }

    async findByCouponId(couponId: string) {
        return await CouponModel.findOne({ couponId }, { _id: 0, __v: 0 }).lean();
    }

    async findByCode(code: string) {
        return await CouponModel.findOne({ code: code.toUpperCase() }, { _id: 0, __v: 0 }).lean();
    }

    async updateCoupon(couponId: string, updateData: UpdateQuery<ICoupon>) {
        return await CouponModel.findOneAndUpdate({ couponId }, updateData, { new: true }).lean();
    }

    /**
     * Get all coupons with optional filters, pagination, and search
     * @param {FilterQuery<ICoupon> & Record<string, any>} filter - Mongoose filter object with optional search, sortBy, page, limit
     * @returns {Promise<ICouponDoc[]>}
     */
    async getAllCoupons(filter: FilterQuery<ICoupon> & Record<string, any> = {}): Promise<ICouponDoc[]> {
        const { sortBy, order, page, limit, search, ...pureFilter } = filter;

        // Optional search on title or code
        if (search) {
            pureFilter.$or = [
                { title: { $regex: search, $options: "i" } },
                { code: { $regex: search, $options: "i" } }
            ];
        }

        const queryOptions = extractQueryOptions({ sortBy, order, page, limit });

        return await CouponModel.find(pureFilter, { _id: 0, __v: 0 })
            .sort(queryOptions.sort)
            .skip(queryOptions.skip || 0)
            .limit(queryOptions.limit || 10)
            .lean();
    }

    async deleteCoupon(couponId: string) {
        return await CouponModel.findOneAndDelete({ couponId });
    }

    async incrementUsage(couponId: string) {
        return await CouponModel.findOneAndUpdate(
            { couponId },
            { $inc: { count: 1 } },
            { new: true }
        ).lean();
    }

    async deactivateCoupon(couponId: string) {
        return await CouponModel.findOneAndUpdate(
            { couponId },
            { $set: { isActive: false } },
            { new: true }
        ).lean();
    }
}
