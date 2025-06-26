import { IAddress } from "./utils.interface.js";

export interface IRiderDocument {
  vehicle: {
    vehicleNumber: string;
    license: {
      number: string;
      image: string;
    };
    rc: {
      number: string;
      images: string[]; // multiple allowed
    };
    insurance: {
      number: string;
      image: string;
    };
  };
  identification: {
    aadharNumber: string;
    aadharImage: string;
    panNumber: string;
    panImage: string;
  };
  banking: {
    accountNumber: string;
    ifscCode: string;
    passbookImage: string;
  };
};

export interface IRider {
  riderId: string;
  name: string;
  phoneNumber: string;
  email?: string;
  dateOfBirth?: string;
  address: IAddress;
  vehicleType: "bike" | "scooter" | "electric-vehicle";
  profilePhoto?: string;

  // Replaced documentProofs with this full structure
  documents: IRiderDocument

  isVerified?: boolean;
  isAvailable?: boolean;

  lastLocation?: {
    lat: number;
    lng: number;
  };
  createdAt?: Date;
  updatedAt?: Date;
}
