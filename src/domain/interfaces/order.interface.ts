import { IRestaurant } from "./restaurant.interface";
import { IUser } from "./user.interface";
import { IAddress } from "./utils.interface";

export interface IOrderFoodItem {
  foodItemId: string;
  name: string;
  quantity: number;
  price: number;
  additionals?: { name: string; price: number }[];
}

export interface ICouponApplied {
  couponId: string;       // Coupon's ObjectId as string
  code: string;           // e.g., "LASTBITE50"
  discountValue: number;  // Final discount applied for this coupon in the order
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
  dropoff: Omit<IAddress, "tag">;
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

export interface IOrderFeedback {
  orderRating: number;      // how was the food ( in stars )
  riderRating?: number;      // how was the delivery experience ( in stars )
  review?: string;          // optional, general remarks
}


export type FeedbackIssueTag =
  | "cold_food"
  | "late_delivery"
  | "missing_item"
  | "poor_packaging"
  | "rude_rider"
  | "order_incorrect";

export interface IPidgeOrder{
  pidgeId: string;       // Internal Pidge order ID (e.g., "1754000237925PEW8OVGI")
  orderId: string;       // Your own reference ID (e.g., "ORD123456")
  billAmount: number;    // Total billable amount for delivery
  status: "cancelled" | "pending" | "fulfilled" | "completed";
}

export interface IOrder {
  orderId?: string;
  refIds: IRefIds;
  foodItems: IOrderFoodItem[];
  pricing: IOrderPricing;
  delivery?: {
    location: IOrderLocation;
    pidge?: IPidgeOrder;
  };

  notes?: string;

  coupons?:ICouponApplied[]

  payment: {
    paymentId?: string;
    paymentType: IPaymentType;
  };

  orderStatus: IOrderStatusEnum;
  feedback?: IOrderFeedback;
  createdAt?: Date;
  updatedAt?: Date;
}
