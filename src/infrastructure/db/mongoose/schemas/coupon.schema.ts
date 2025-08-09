import { Schema, model, Document } from "mongoose";
import { addCustomIdHook } from "../../../../utils/addCustomIdHook.js";
import { ICoupon } from "../../../../domain/interfaces/coupon.interface.js";

export interface ICouponDoc extends ICoupon, Document {}

const CouponSchema = new Schema<ICouponDoc>(
  {
    couponId: { type: String, unique: true },
    title: { type: String, required: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ["PERCENTAGE", "FIXED"], required: true },
    discountValue: { type: Number, required: true },
    limit: { type: Schema.Types.Mixed, required: true },
    count: { type: Number, default: 0 },
    minOrderValue: { type: Number },
    startDate: { type: Date },
    endDate: { type: Date },
    isActive: { type: Boolean, default: true },
    description: { type: String }
  },
  { timestamps: true }
);

addCustomIdHook(CouponSchema, "couponId", "cpn", "Coupon");

export interface CouponDoc extends ICoupon, Document { }
export const CouponModel = model<ICouponDoc>("Coupon", CouponSchema);
