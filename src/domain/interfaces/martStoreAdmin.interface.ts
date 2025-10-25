import { IFCM } from "./notification.interface.js";

export interface IMartStoreAdmin {
  martStoreAdminId: string;
  martStoreId: string;
  name: string;
  fcmTokens?: IFCM[];
  phoneNumber: string;
  email?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
