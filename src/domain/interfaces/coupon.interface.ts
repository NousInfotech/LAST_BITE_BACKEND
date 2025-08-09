export type CouponLimitType = number | "unlimited";
export type CouponType = "PERCENTAGE" | "FIXED";
export enum CouponTypeEnum {
  PERCENTAGE = "PERCENTAGE",
  FIXED = "FIXED",
}

export interface ICoupon {
  couponId?: string;
  title: string;
  code: string;
  type: CouponType;
  discountValue: number;
  limit: CouponLimitType;
  count?: number;
  minOrderValue?: number;
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
