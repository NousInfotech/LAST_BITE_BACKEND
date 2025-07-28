import { Request, Response } from "express";
import { sendResponse } from "../../utils/sendResponse.js";
import { sendError } from "../../utils/sendError.js";
import { HTTP } from "../../utils/constants.js";
import { tryCatch } from "../../utils/tryCatch.js";
import { getPidgeQuote, getPidgeOrderStatus, getPidgeTracking } from "../../application/services/pidge.service.js";
import { validate } from "../../utils/validation.js";
import { GetPidgeQuoteSchema } from "../validators/pidge.validator.js";

export const PidgeController = {
    // Existing createOrder method...

    async getPidgeQuote(req: Request, res: Response) {
        const validated = validate(GetPidgeQuoteSchema, req.body, res);
        if (!validated) return; // early exit if validation failed

        const { pickup, drop } = validated;

        return tryCatch(res, async () => {
            const quote = await getPidgeQuote({ pickup, drop });
            if (!quote) sendError(res, HTTP.SERVICE_UNAVAILABLE, "Service Unavailable from pidge")
            return sendResponse(res, HTTP.OK, "Pidge quote retrieved successfully", quote);
        });
    },

    async getPidgeTracking(req: Request, res: Response) {
        return tryCatch(res, async () => {
            const { orderId } = req.params;
            const tracking = await getPidgeTracking(orderId);
            return sendResponse(res, HTTP.OK, "Tracking info retrieved", tracking);
        });
    },

    async getPidgeOrderStatus(req: Request, res: Response) {
        return tryCatch(res, async () => {
            const { orderId } = req.params;
            const status = await getPidgeOrderStatus(orderId);
            return sendResponse(res, HTTP.OK, "Order status retrieved", status);
        });
    }
};
