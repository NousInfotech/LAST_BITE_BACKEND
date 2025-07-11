import { Schema, Document, Model, model } from "mongoose";
import { addCustomIdHook } from "../../../../utils/addCustomIdHook.js";
import { IPayment } from "../../../../domain/interfaces/payment.interface.js";

export interface PaymentDoc extends IPayment, Document {}

const paymentSchema = new Schema<PaymentDoc>(
  {
    paymentId: { type: String, unique: true },
    razorpay: {
      orderId: { type: String, required: true },
      paymentId: { type: String, required: true },
    },
    linkedOrderId: { type: String },
    paymentStatus: {
      type: String,
      enum: ["PAID", "CANCELLED", "REFUND"],
      required: true,
    },
    amount: {
      total: { type: Number, required: true },
      currency: { type: String, default: "INR" },
    },
    payments: {
      restaurant: { type: Number, required: true },
      rider: { type: Number, required: true },
      platform: { type: Number, required: true },
    },
    timestamps: {
      createdAt: { type: Date, default: Date.now },
      paidAt: { type: Date },
      refundedAt: { type: Date },
    },
  },
  { timestamps: true }
);

addCustomIdHook(paymentSchema, "paymentId", "pay", "Payment");

export const PaymentModel: Model<PaymentDoc> = model<PaymentDoc>("Payment", paymentSchema); 