import { NotificationModel } from "../db/mongoose/schemas/notification.schema.js";
import { INotification } from "../../domain/interfaces/notification.interface.js";

export class NotificationRepository {
  async createNotification(notification: INotification) {
    return await NotificationModel.create(notification);
  }

  async getNotificationsByTarget(targetRole: INotification["targetRole"], targetRoleId: string) {
    return await NotificationModel.find({
      targetRole,
      targetRoleId
    }).sort({ createdAt: -1 });
  }

  async markAsRead(notificationId: string) {
    return await NotificationModel.findOneAndUpdate(
      { notificationId },
      { read: true },
      { new: true }
    );
  }

  async markAllAsRead(targetRole: INotification["targetRole"], targetRoleId: string) {
    return await NotificationModel.updateMany(
      { targetRole, targetRoleId, read: false },
      { $set: { read: true } }
    );
  }

  async deleteNotification(notificationId: string) {
    return await NotificationModel.findOneAndDelete({ notificationId });
  }

  async deleteAllNotifications(targetRole: INotification["targetRole"], targetRoleId: string) {
    return await NotificationModel.deleteMany({ targetRole, targetRoleId });
  }
}
