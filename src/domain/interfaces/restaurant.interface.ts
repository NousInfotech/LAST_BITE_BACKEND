export interface IAddress {
    latitude: number;
    longitude: number;
    no: string;
    street: string;
    area: string;
    city: string;
    state: string;
    country: string;
    fullAddress: string;
    tag?: "home" | "office" | "friends" | "others";
}

export interface ITiming {
    day: string;
    shifts: { start: string; end: string }[];
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
}

export interface IRestaurant {
    restaurantId?: string;
    restaurantName: string;
    address: IAddress;
    documents: IDocuments;
    timings: ITiming[];
    tags: string[];
    cuisines?: string[];
    typeOfFood?: string;
    profilePhoto?: string;
    isActive?: boolean;
}
