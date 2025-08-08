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
            console.log(`🔍 [PIDGE TRACKING] Request received for orderId: ${orderId}`);
            console.log(`🔍 [PIDGE TRACKING] Request headers:`, req.headers);
            console.log(`🔍 [PIDGE TRACKING] Request params:`, req.params);
            
            try {
                const tracking = await getPidgeTracking(orderId);
                console.log(`✅ [PIDGE TRACKING] Success for orderId: ${orderId}`, tracking);
                return sendResponse(res, HTTP.OK, "Tracking info retrieved", tracking);
            } catch (error: any) {
                console.error(`❌ [PIDGE TRACKING] Error for orderId: ${orderId}:`, error);
                return sendError(res, HTTP.INTERNAL_SERVER_ERROR, `Tracking failed: ${error.message}`);
            }
        });
    },

    async getPidgeOrderStatus(req: Request, res: Response) {
        return tryCatch(res, async () => {
            const { orderId } = req.params;
            console.log(`🔍 [PIDGE STATUS] Request received for orderId: ${orderId}`);
            
            try {
                const status = await getPidgeOrderStatus(orderId);
                console.log(`✅ [PIDGE STATUS] Success for orderId: ${orderId}`, status);
                return sendResponse(res, HTTP.OK, "Order status retrieved", status);
            } catch (error: any) {
                console.error(`❌ [PIDGE STATUS] Error for orderId: ${orderId}:`, error);
                return sendError(res, HTTP.INTERNAL_SERVER_ERROR, `Status check failed: ${error.message}`);
            }
        });
    }
};
