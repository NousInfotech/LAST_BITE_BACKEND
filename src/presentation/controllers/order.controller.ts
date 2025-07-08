import { Request as ExpressRequest, Response } from "express";
import { OrderUseCase } from "../../application/use-cases/order.useCase.js";
import { createOrderService } from "../../application/services/razorpay.service.js";
import { validatePaymentVerification } from "razorpay/dist/utils/razorpay-utils.js";
import { config } from "../../config/env.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { sendError } from "../../utils/sendError.js";
import { tryCatch } from "../../utils/tryCatch.js";
import { HTTP } from "../../utils/constants.js";
import { RazorpayOrderInput, RazorpayVerifyInput, CodOrderInput } from "../validators/order.validator.js";
import { validate } from "../../utils/validation.js";

interface AuthRequest extends ExpressRequest {
  userId?: string;
}

export const OrderController = {
  // POST /payment/create (Razorpay)
  async createRazorpayOrder(req: AuthRequest, res: Response) {
    return tryCatch(res, async () => {
      const userId = req.userId as string;
      const validation = validate(RazorpayOrderInput, req.body, res);
      if (!validation) return;
      const { items, restaurantId, notes } = validation;
      // Calculate amount (simulate, or use a pricing util if needed)
      // For now, require amount from frontend or calculate here if needed
      // We'll just use a placeholder amount for demonstration
      const amount = 1000; // TODO: Calculate based on items, restaurant, etc.
      const razorpayOrder = await createOrderService({
        amount,
        currency: "INR",
        receipt: `order_${Date.now()}`,
        notes: { userId, items, restaurantId, notes },
      });
      return sendResponse(res, HTTP.CREATED, "Razorpay order created", { razorpayOrderId: razorpayOrder.id });
    });
  },

  // POST /payment/verify (Razorpay)
  async verifyRazorpayPayment(req: AuthRequest, res: Response) {
    return tryCatch(res, async () => {
      const userId = req.userId as string;
      const validation = validate(RazorpayVerifyInput, req.body, res);
      if (!validation) return;
      const { orderId, paymentId, signature, notes } = validation;
      const isValid = validatePaymentVerification(
        { order_id: orderId, payment_id: paymentId },
        signature,
        config.razorpayKeySecret
      );
      if (!isValid) {
        return sendError(res, HTTP.BAD_REQUEST, "Invalid payment signature");
      }
      // Now create the app order and payment
      const { items, restaurantId, notes: orderNotes } = notes;
      const paymentType = "ONLINE";
      const result = await OrderUseCase.createOrderWithPayment({
        user: { userId },
        items,
        restaurantId,
        paymentType,
        notes: orderNotes,
      });
      return sendResponse(res, HTTP.OK, "Payment verified and order created", result);
    });
  },

  // POST /create (COD)
  async createCODOrder(req: AuthRequest, res: Response) {
    return tryCatch(res, async () => {
      const userId = req.userId as string;
      const validation = validate(CodOrderInput, { ...req.body, userId }, res);
      if (!validation) return;
      const { items, restaurantId, notes } = validation;
      const paymentType = "COD";
      const result = await OrderUseCase.createOrderWithPayment({
        user: { userId },
        items,
        restaurantId,
        paymentType,
        notes,
      });
      return sendResponse(res, HTTP.CREATED, "Order created successfully (COD)", result);
    });
  },
}; 