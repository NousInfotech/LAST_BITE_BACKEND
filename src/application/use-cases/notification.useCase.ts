import { INotification } from "../../domain/interfaces/notification.interface.js";
import { NotificationRepository } from "../../infrastructure/repositories/notification.repository.js";

const notificationRepo = new NotificationRepository();

export const NotificationUseCase = {
  create: (data: INotification) => notificationRepo.createNotification(data),

  getByTarget: (targetRole: INotification["targetRole"], targetRoleId: string) =>
    notificationRepo.getNotificationsByTarget(targetRole, targetRoleId),

  markAsRead: (notificationId: string) =>
    notificationRepo.markAsRead(notificationId),

  markAllAsRead: (targetRole: INotification["targetRole"], targetRoleId: string) =>
    notificationRepo.markAllAsRead(targetRole, targetRoleId),

  delete: (notificationId: string) =>
    notificationRepo.deleteNotification(notificationId),

  deleteAll: (targetRole: INotification["targetRole"], targetRoleId: string) =>
    notificationRepo.deleteAllNotifications(targetRole, targetRoleId)
};
