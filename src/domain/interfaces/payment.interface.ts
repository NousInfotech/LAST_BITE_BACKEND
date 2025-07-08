export interface IPayment {
  paymentId: string;
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
  payments: {
    restaurant: number;
    rider: number;
    platform: number;
  };
  method: "RAZORPAY";
  timestamps: {
    createdAt: Date;
    paidAt?: Date;
    refundedAt?: Date;
  };
} 