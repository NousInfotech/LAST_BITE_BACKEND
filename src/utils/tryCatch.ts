import { Response } from "express";
import { HTTP } from "./constants.js";
import { sendError } from "./sendError.js";

export const tryCatch = async (res: Response, callback: () => Promise<any>) => {
    try {
        await callback();
    } catch (err) {
        console.error(err);
        sendError(res, HTTP.SERVER_ERROR, "Internal server error", err);
    }
};
