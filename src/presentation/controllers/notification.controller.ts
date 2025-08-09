import { Response } from "express";
import { NotificationUseCase } from "../../application/use-cases/notification.useCase.js";
import { tryCatch } from "../../utils/tryCatch.js";
import { validate } from "../../utils/validation.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { sendError } from "../../utils/sendError.js";
import { HTTP } from "../../utils/constants.js";
import { CustomRequest } from "../../domain/interfaces/utils.interface.js";
import {
    notificationIdValidator,
    targetRoleAndIdValidator,
} from "../validators/notification.validator.js";

export const NotificationController = {
    async getNotifications(req: CustomRequest, res: Response) {
        const parsed = validate(targetRoleAndIdValidator, req.query, res);
        if (!parsed) return;

        const { targetRole, targetRoleId } = parsed;

        return tryCatch(res, async () => {
            const notifications = await NotificationUseCase.getByTarget(targetRole, targetRoleId);
            if (!notifications || notifications.length === 0) {
                return sendError(res, HTTP.NOT_FOUND, "No notifications found");
            }
            return sendResponse(res, HTTP.OK, "Notifications fetched successfully", notifications);
        });
    },

    async markAsRead(req: CustomRequest, res: Response) {
        const parsed = validate(notificationIdValidator, req.params, res);
        if (!parsed) return;

        const { notificationId } = parsed;

        return tryCatch(res, async () => {
            const updated = await NotificationUseCase.markAsRead(notificationId);
            if (!updated) return sendError(res, HTTP.NOT_FOUND, "Notification not found or already read");
            return sendResponse(res, HTTP.OK, "Notification marked as read", updated);
        });
    },
    async markAllAsRead(req: CustomRequest, res: Response) {
        const parsed = validate(targetRoleAndIdValidator, req.query, res);
        if (!parsed) return;

        const { targetRole, targetRoleId } = parsed;

        return tryCatch(res, async () => {
            const updated = await NotificationUseCase.markAllAsRead(targetRole, targetRoleId);
            if (!updated) return sendError(res, HTTP.NOT_FOUND, "Notification not found or already read");
            return sendResponse(res, HTTP.OK, "Notification marked as read", updated);
        });
    },

    async deleteNotification(req: CustomRequest, res: Response) {
        const parsed = validate(notificationIdValidator, req.params, res);
        if (!parsed) return;

        const { notificationId } = parsed;

        return tryCatch(res, async () => {
            const deleted = await NotificationUseCase.delete(notificationId);
            if (!deleted) return sendError(res, HTTP.NOT_FOUND, "Notification not found or already deleted");
            return sendResponse(res, HTTP.OK, "Notification deleted successfully");
        });
    },
};
