import { Request, Response } from "express";
import { PaymentUseCase } from "../../application/use-cases/payment.useCase.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { sendError } from "../../utils/sendError.js";
import { HTTP } from "../../utils/constants.js";

export const PaymentController = {
  async listWeekly(req: Request, res: Response) {
    const { restaurantId, weekStart } = req.query;
    if (!restaurantId) return sendError(res, HTTP.BAD_REQUEST, "restaurantId is required");
    try {
      const data = await PaymentUseCase.listByRestaurantWeekly(String(restaurantId), weekStart as string | undefined);
      return sendResponse(res, HTTP.OK, "Payments fetched", data);
    } catch (e) {
      return sendError(res, HTTP.INTERNAL_SERVER_ERROR, "Failed to fetch payments");
    }
  },

  async updateSettlementStatus(req: Request, res: Response) {
    const { restaurantId, weekKey, status } = req.body || {};
    if (!restaurantId || !weekKey || !status) return sendError(res, HTTP.BAD_REQUEST, "restaurantId, weekKey and status are required");
    try {
      const result = await PaymentUseCase.updateSettlementStatus(String(restaurantId), String(weekKey), status);
      return sendResponse(res, HTTP.OK, "Settlement status updated", result);
    } catch (e) {
      return sendError(res, HTTP.INTERNAL_SERVER_ERROR, "Failed to update settlement status");
    }
  },
};


