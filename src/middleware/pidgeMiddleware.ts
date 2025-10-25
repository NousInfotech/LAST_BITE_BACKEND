import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/sendError.js";
import { HTTP } from "../utils/constants.js";
import { config } from "../config/env.js";

export interface PidgeAuthenticatedRequest extends Request {
    pidgeVerified?: boolean;
}

/**
 * Middleware to verify Pidge webhook token
 * This middleware validates the token sent by Pidge in webhook requests
 */
export const pidgeMiddleware = (req: PidgeAuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        // Get the token from the Authorization header
        const authHeader = req.headers.authorization;
        console.log("headers :"+req.headers);
        console.log("token :"+authHeader);
        
        if (!authHeader) {
            console.log("❌ [PIDGE MIDDLEWARE] No authorization header or invalid format");
            sendError(res, HTTP.UNAUTHORIZED, "Unauthorized: No Pidge token provided");
            return;
        }

        const token = authHeader;
        
        if (!token) {
            console.log("❌ [PIDGE MIDDLEWARE] No token found in authorization header");
            sendError(res, HTTP.UNAUTHORIZED, "Unauthorized: Invalid token format");
            return;
        }

        // Verify the token against the configured webhook token
        if (token !== config.pidgeWebhookToken) {
            console.log("❌ [PIDGE MIDDLEWARE] Token verification failed");
            console.log(`Expected: ${config.pidgeWebhookToken}`);
            console.log(`Received: ${token}`);
            sendError(res, HTTP.UNAUTHORIZED, "Unauthorized: Invalid Pidge token");
            return;
        }

        // Token is valid, mark request as verified
        req.pidgeVerified = true;
        console.log("✅ [PIDGE MIDDLEWARE] Token verified successfully");
        
        next();
    } catch (error) {
        console.error("❌ [PIDGE MIDDLEWARE] Error during token verification:", error);
        sendError(res, HTTP.INTERNAL_SERVER_ERROR, "Internal server error during token verification", error);
        return;
    }
};
