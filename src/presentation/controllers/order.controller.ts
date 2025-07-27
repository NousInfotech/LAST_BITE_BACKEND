import { Request, Response } from "express";
import { OrderUseCase } from "../../application/use-cases/order.useCase.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { sendError } from "../../utils/sendError.js";
import { HTTP } from "../../utils/constants.js";
import { tryCatch } from "../../utils/tryCatch.js";
import { validate } from "../../utils/validation.js";
import { OrderCreateSchema, OrderVerifySchema, OrderStatusUpdateSchema, OrderFeedbackSchema } from "../validators/order.validator.js";
import { CustomRequest } from "../../domain/interfaces/utils.interface.js";

export const OrderController = {
    async createOrder(req: CustomRequest, res: Response) {
        const userId = req.userId
        const validated = validate(OrderCreateSchema, { ...req.body, userId }, res);
        if (!validated) return;
        return tryCatch(res, async () => {
            const { userId, restaurantId, items, orderNotes, location } = validated;
            const order = await OrderUseCase.createOnlineOrder({
                userId,
                restaurantId,
                items,
                orderNotes,
                location,
            });
            return sendResponse(res, HTTP.CREATED, "Razorpay Order created successfully", order);
        });
    },

    async verifyOrder(req: Request, res: Response) {
        const validated = validate(OrderVerifySchema, req.body, res);
        if (!validated) return;
        return tryCatch(res, async () => {
            const verifiedOrder = await OrderUseCase.verifyPaymentAndCreateOrder(validated)
            if (!verifiedOrder) return sendError(res, HTTP.INTERNAL_SERVER_ERROR, "Error in Order Creation")
            return sendResponse(res, HTTP.CREATED, "Order created successfully", verifiedOrder);
        })
    },

    async updateOrderStatus(req: Request, res: Response) {
        const { orderId } = req.params;
        const validated = validate(OrderStatusUpdateSchema, { ...req.body, orderId }, res);
        if (!validated) return;
        return tryCatch(res, async () => {
            const updatedOrder = await OrderUseCase.updateOrderStatus(orderId, validated.status);
            if (!updatedOrder) return sendError(res, HTTP.NOT_FOUND, "Order not found or status not updated");
            return sendResponse(res, HTTP.OK, "Order status updated", updatedOrder);
        });
    },

    async orderFeeback(req: Request, res: Response) {
        const { orderId } = req.params;
        const validated = validate(OrderFeedbackSchema, req.body, res);
        if (!validated) return;
        return tryCatch(res, async () => {
            const updatedOrder = await OrderUseCase.customerFeedback(orderId, validated);
            if (!updatedOrder) return sendError(res, HTTP.NOT_FOUND, "Order not found or feedback not posted");
            return sendResponse(res, HTTP.OK, "Order feedback updated", updatedOrder);
        });
    }
};
