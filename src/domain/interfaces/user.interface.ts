import { IAddress } from "./utils.interface.js";

export interface IUser {
    userId?: string;
    name: string;
    phoneNumber: string;
    email?: string;
    favourites?: string[];
    profileImage?: string;
    addresses?: IAddress[];
    createdAt?: Date;
    updatedAt?: Date;
}
