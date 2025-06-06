import { IAddress } from "./utils.interface.js";


export interface IRider {
    riderId: string;
    name: string;
    phoneNumber: string;
    email?: string;
    dateOfBirth?: string;
    address:IAddress;
    vehicleType: "bike" | "scooter" | "car";
    vehicleNumber?: string;
    licenseNumber?: string;
    aadharNumber?: string;
    profilePhoto?: string;
    documentProofs?: string[];
    isVerified?: boolean;
    isAvailable?: boolean;
    lastLocation?: {
      lat: number;
      lng: number;
    };
    createdAt?: Date;
    updatedAt?: Date;
  }
  