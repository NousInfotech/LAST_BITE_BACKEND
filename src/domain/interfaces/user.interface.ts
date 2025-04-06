export interface IAddress {
    latitude?: number;
    longitude?: number;
    no?: string;
    street?: string;
    area?: string;
    city?: string;
    state?: string;
    country?: string;
    fullAddress?: string;
    tag?: "home" | "office" | "friends" | "others";
}

export interface IUser {
    _id?: string;
    userId?: string;
    name: string;
    phoneNumber: string;
    email?: string;
    firebaseId: string;
    profileImage?: string;
    addresses?: IAddress[];
    createdAt?: Date;
    updatedAt?: Date;
}
