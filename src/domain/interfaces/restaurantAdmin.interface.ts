import { IFCM } from "./notification.interface.js";

export interface IRestaurantAdmin {
  restaurantAdminId: string;
  restaurantId: string;
  name: string;
  fcmTokens: IFCM[];
  phoneNumber: string;
  email?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
