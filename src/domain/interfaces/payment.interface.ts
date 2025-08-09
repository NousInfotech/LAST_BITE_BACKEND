// Minimal inline type to avoid import coupling here
export type CouponTypeEnum = 'PERCENTAGE' | 'FIXED';

export interface IPayment {
  paymentId?: string;
  razorpay: {
    orderId: string;
    paymentId: string;
  };
  linkedOrderId?: string;
  paymentStatus: "PAID" | "CANCELLED" | "REFUND";

  amount: {
    total: number;
    currency: "INR";
  };

  breakdown: {
    foodItemTotal: number;
    packagingFee: number;
    platformFee: number;
    deliveryFee: number;
    discount?: number;
    tax: {
      stateGST: number;
      centralGST: number;
      total: number;
    };
  };

  distribution: {
    restaurant: number;
    platform: number;
    deliveryPartner: number;
  };

  timestamps: {
    createdAt: Date;
    paidAt?: Date;
    refundedAt?: Date;
  };

  // Aggregation helpers
  ref?: {
    restaurantId?: string;
    userId?: string;
  };
  settlement?: {
    weekKey?: string; // e.g., 2025-W32
    status?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  };
}

export interface IDiscount {
  type: CouponTypeEnum,
  number: number,
}

