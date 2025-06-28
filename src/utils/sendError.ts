import { ISendError } from "../domain/interfaces/utils.interface.js";

/**
 * Send a standardized error response
 */
export const sendError = (
    res: ISendError["res"],
    statusCode: ISendError["statusCode"] = 500,
    message: ISendError["message"] = "Something went wrong",
    error: ISendError["error"] = null
) => {
    return res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        error: error?.message || error || "Unknown error",
    });
};
