import { IAddressGeo } from "./restaurant.interface.js";
import { RestaurantStatusEnum } from "./utils.interface.js";

export interface IMartDocuments {
    gstinNumber: string;
    gstCertificateImage: string;
    tradeLicenseNumber?: string;
    tradeLicenseImage?: string;
    cancelledChequeImage?: string;
    bankIFSC: string;
    bankAccountNumber: string;
}

export interface IMartStoreStatus {
    status: RestaurantStatusEnum;
    message?: string;
    days?: number;
    updatedAt?: Date;
}

export interface IMartStore {
    martStoreId: string; // public-friendly unique ID
    martStoreName: string;
    address: IAddressGeo;
    documents: IMartDocuments;
    isAvailable: boolean; // toggle store visibility
    storeStatus?: IMartStoreStatus;
    packagingCharges?: number; // optional per item/order
    tags?: string[]; // e.g., ["organic", "24x7", "express"]
    storeLogo?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
