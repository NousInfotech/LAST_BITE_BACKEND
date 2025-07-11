import { config } from "../../config/env.js";
import { razorpayInstance } from "../../config/razorpay.config.js";
import { CURRENCY } from "../../utils/constants.js";
import { validatePaymentVerification } from 'razorpay/dist/utils/razorpay-utils.js';

interface CreateOrderParams {
  amount: number;
  receipt?: string;
  notes?: Record<string, any>;
}

export async function createRazorpayOrderService(params: CreateOrderParams) {
  const { receipt, notes, amount } = params;
  const order = await razorpayInstance.orders.create({
    amount,
    currency: CURRENCY,
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
  const isValid = validatePaymentVerification(
    { order_id: orderId, payment_id: paymentId },
    signature,
    config.razorpayKeySecret as string,
  );
  return isValid;
}

// Get Razorpay Order by ID
export async function getRazorpayOrderById(orderId: string) {
  return await razorpayInstance.orders.fetch(orderId);
}

// Get Razorpay Payment by Order ID
export async function getRazorpayPaymentByOrderId(orderId: string) {
  const payments = await razorpayInstance.orders.fetchPayments(orderId);
  return payments; // Contains .items[] of all payments under that order
}

// Refund Razorpay Payment
export async function refundRazorpayPayment(
  paymentId: string,
  amount?: number // Optional: refund partial amount (in paise)
) {
  const refund = await razorpayInstance.payments.refund(paymentId, {
    amount, // Leave undefined to refund full amount
  });
  return refund;
}
