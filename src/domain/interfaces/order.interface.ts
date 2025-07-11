import { IRestaurant } from "./restaurant.interface";
import { IUser } from "./user.interface";

export interface IOrderFoodItem {
  foodItemId: string;
  name: string;
  quantity: number;
  price: number;
  additionals?: { name: string; price: number }[];
}

export interface IOrderPricing {
  itemsTotal: number;
  packagingFee: number;
  deliveryFee: number;
  platformFee: number;
  tax: number;
  discount?: number;
  finalPayable: number;
}

export interface IOrderLocation {
  pickup: { lat: number; lng: number };
  dropoff: { lat: number; lng: number };
  distance?: number;
}

export type IOrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "ASSIGNED"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "CANCELLED"
  | "FAILED";

  export enum IPaymentType {
    ONLINE = "ONLINE",
    COD = "COD", // optional if you allow COD later
  }
  
  export enum IOrderStatusEnum {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    ASSIGNED = "ASSIGNED",
    IN_TRANSIT = "IN_TRANSIT",
    DELIVERED = "DELIVERED",
    CANCELLED = "CANCELLED",
    FAILED = "FAILED",
    IN_PROGRESS = "IN_PROGRESS",
  }

export interface IRefIds {
  userId: IRestaurant['restaurantId'];
  restaurantId: IUser['userId'];
}

export interface IOrder {
  orderId?: string;
  refIds: IRefIds;
  foodItems: IOrderFoodItem[];
  pricing: IOrderPricing;
  delivery?: {
    location: IOrderLocation;
    pidge?: {
      networkId: string;
      quoteId: string;
      price: number;
      status: "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
      trackingUrl?: string;
    };
  };

  notes?: string;

  payment: {
    paymentId?: string;
    paymentType: IPaymentType;
  };

  orderStatus: IOrderStatusEnum;

  createdAt?: Date;
  updatedAt?: Date;
}
