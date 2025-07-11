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
  timestamps: {
    createdAt: Date;
    paidAt?: Date;
    refundedAt?: Date;
  };
} 