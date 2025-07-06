import { IAddress } from "./utils.interface.js";

export interface Favourites {
    restaurants?: string[];
    foodItems?: string[];
}

export interface IUserCart {
    foodItemId: string;
    quantity: number;
}

export interface IUser {
    userId?: string;
    name: string;
    phoneNumber: string;
    email?: string;
    favourites?: Favourites;
    hiddenRestaurants?: string[];
    profileImage?: string;
    addresses?: IAddress[];
    cart: IUserCart[];
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IUserCollection {
    userId: string;
    collectionId: string;      // Your custom user ID (e.g. usr_abc123)
    name: string;              // Collection name
    foodItemIds: string[];     // List of food item IDs
    createdAt?: Date;
    updatedAt?: Date;
}

