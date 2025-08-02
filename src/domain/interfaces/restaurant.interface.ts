import { RestaurantStatusEnum, Days, FoodType } from "./utils.interface";

export interface IAddressGeo {
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  no: string;
  street: string;
  area: string;
  city: string;
  state: string;
  country: string;
  fullAddress: string;
  pincode: string;
  tag?: string;
}

export interface IDocuments {
  panNumber: string;
  panImage: string;
  shopLicenseImage: string;
  fssaiCertificateNumber: string;
  fssaiCertificateImage: string;
  gstinNumber: string;
  gstCertificateImage: string;
  cancelledChequeImage: string;
  bankIFSC: string;
  bankAccountNumber: string;
  partnershipAgreement: string;
}

export interface ITimings {
  day: Days;
  shifts: {
    start: string;
    end: string
  }[]
}

export interface IRestaurantStatus {
  status: RestaurantStatusEnum;
  message?: string;
  days?: number;
  updatedAt?: string | Date;
}


export interface IRestaurant {
  restaurantId?: string;
  restaurantName: string;
  address: IAddressGeo;
  documents: IDocuments;
  timings: ITimings[];
  tags: string[];
  cuisines?: string[];
  typeOfFood?: FoodType[];
  profilePhoto?: string;
  menuImages: string[];
  isActive?: boolean;
  restaurantStatus?: IRestaurantStatus;
  availableCategories: string[]; // e.g., ["biryani", "noodles", "desserts"]
  rating?: number; // from 1.0 to 5.0
  packagingCharges?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
