import { IAddress } from "./utils.interface.js";

export interface Favourites {
    restaurants?: string[];
    foodItems?: string[];
}

export interface IUser {
    userId?: string;
    name: string;
    phoneNumber: string;
    email?: string;
    favourites?: Favourites;
    profileImage?: string;
    addresses?: IAddress[];
    createdAt?: Date;
    updatedAt?: Date;
}
