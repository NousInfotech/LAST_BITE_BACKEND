import { Request, Response } from "express";

export interface ISendResponse {
    res: Response;
    success: boolean;
    statusCode: number;
    message: string;
    data?: any;
}

export interface ISendError {
    res: Response;
    statusCode?: number;
    message?: string;
    error?: any;
}

export interface IHTTPStatusCodes {
    [key: string]: number;
}
export enum Days {
    MONDAY = "MONDAY",
    TUESDAY = "TUESDAY",
    WEDNESDAY = "WEDNESDAY",
    THURSDAY = "THURSDAY",
    FRIDAY = "FRIDAY",
    SATURDAY = "SATURDAY",
    SUNDAY = "SUNDAY"
}

export enum RoleEnum {
    user = "user",
    restaurantAdmin = "restaurantAdmin",
    rider = "rider",
    superAdmin = "superAdmin",
}


export type Role = "user" | "restaurantAdmin" | "rider" | "superAdmin";
export interface IAddress {
    _id: string;
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
export enum FoodType {
    VEG = "veg",
    NON_VEG = "non_veg",
    HALAL = "halal",
    VEGAN = "vegan",
    KOSHER = "kosher",
    GLUTEN_FREE = "gluten_free",
    JAIN = "jain",
    EGGETARIAN = "eggetarian",
    SEAFOOD = "seafood",
    ORGANIC = "organic"
}

export enum FavoritesActions {
    ADD = "add",
    REMOVE = "remove"
}

export interface CustomRequest extends Request {
    role?: Role;
    userId?: string;
    restaurantAdminId?: string;
    superAdminId?: string;
    riderId?: string;
}

