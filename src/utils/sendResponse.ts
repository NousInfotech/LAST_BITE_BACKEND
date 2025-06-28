import { ISendResponse } from "../domain/interfaces/utils.interface.js";

/**
 * Send a standardized success response
 */

export const sendResponse = (
    res: ISendResponse["res"],
    statusCode: ISendResponse["statusCode"],
    message: ISendResponse["message"],
    data: ISendResponse["data"] = null
) => {
    return res.status(statusCode).json({
        success: statusCode < 400,
        statusCode,
        message,
        data,
    });
};

