export interface IOrderFoodItem {
  foodItemId: string;
  name: string;
  quantity: number;
  price: number;
  additionals?: { name: string; price: number }[];
}

export interface IOrderPricing {
  itemsTotal: number;
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

export interface IOrder {
  orderId: string;
  paymentId?: string;
  paymentType: "ONLINE";
  userId: string;
  restaurantId: string;
  riderId?: string;
  foodItems: IOrderFoodItem[];
  pricing: IOrderPricing;
  location: IOrderLocation;
  orderStatus: IOrderStatus;
  createdAt: Date;
  updatedAt: Date;
} 