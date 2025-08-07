import { Router } from "express";
import { NotificationController } from "../controllers/notification.controller.js";

const notificationRouter = Router();

// GET notifications by targetRole and targetRoleId
notificationRouter.get("/", NotificationController.getNotifications);

// PATCH mark a single notification as read
notificationRouter.patch("/read/:notificationId", NotificationController.markAsRead);

// PATCH mark all notifications as read for a target
notificationRouter.patch("/read-all", NotificationController.markAllAsRead);

// DELETE a notification by ID
notificationRouter.delete("/:notificationId", NotificationController.deleteNotification);

export default notificationRouter;
