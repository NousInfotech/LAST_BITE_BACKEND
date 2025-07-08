import { config } from "../../config/env.js";
import { razorpayInstance } from "../../config/razorpay.config.js";
import crypto from "crypto";

interface CreateOrderParams {
  amount: number; // in paise
  currency?: string;
  receipt?: string;
  notes?: Record<string, any>;
}

export async function createOrderService(params: CreateOrderParams) {
  const { amount, currency = "INR", receipt, notes } = params;
  const order = await razorpayInstance.orders.create({
    amount,
    currency,
    receipt,
    notes,
  });
  return order;
}

export function verifyOrderService({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const generatedSignature = crypto
    .createHmac("sha256", config.razorpayKeySecret) 
    .update(orderId + "|" + paymentId)
    .digest("hex");
  return generatedSignature === signature;
} 