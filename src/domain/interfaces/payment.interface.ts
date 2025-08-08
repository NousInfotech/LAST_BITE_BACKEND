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
      state: number;
      central: number;
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
}
