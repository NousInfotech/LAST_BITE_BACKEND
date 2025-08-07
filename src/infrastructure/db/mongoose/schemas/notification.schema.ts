import { Schema, model, Document } from "mongoose";
import { addCustomIdHook } from "../../../../utils/addCustomIdHook.js";
import { INotification } from "../../../../domain/interfaces/notification.interface.js";

export interface INotificationDoc extends INotification, Document { }

const NotificationSchema = new Schema<INotificationDoc>(
  {
    notificationId: { type: String, unique: true },
    type: {
      type: String,
      enum: ["common", "order", "promo", "system", "reminder"],
      required: true,
    },
    tags: [{ type: String }],
    targetRole: {
      type: String,
      enum: ["user", "restaurantAdmin"],
      required: true,
    },
    targetRoleId: { type: String, required: true },
    message: { type: String, required: true },
    emoji: { type: String },
    theme: {
      type: String,
      enum: ["success", "warning", "danger", "info", "neutral"],
    },
    metadata: { type: Schema.Types.Mixed, default: {} }, // <-- Flexible metadata
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

addCustomIdHook(NotificationSchema, "notificationId", "ntf", "Notification");

export const NotificationModel = model<INotificationDoc>(
  "Notification",
  NotificationSchema
);
