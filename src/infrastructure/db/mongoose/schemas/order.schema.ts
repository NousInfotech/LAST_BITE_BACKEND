import { Schema, Document, Model, model, Types } from "mongoose";
import { addCustomIdHook } from "../../../../utils/addCustomIdHook.js";
import { IOrder } from "../../../../domain/interfaces/order.interface.js";

// Subschemas
const AdditionalsSchema = new Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
  },
  { _id: false }
); 

const FoodItemSchema = new Schema(
  {
    foodItemId: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    additionals: [AdditionalsSchema],
  },
  { _id: false }
);

const PricingSchema = new Schema(
  {
    itemsTotal: { type: Number, required: true },
    deliveryFee: { type: Number, required: true },
    platformFee: { type: Number, required: true },
    tax: { type: Number, required: true },
    discount: { type: Number },
    finalPayable: { type: Number, required: true },
  },
  { _id: false }
);

const LocationSchema = new Schema(
  {
    pickup: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    dropoff: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    distance: { type: Number },
  },
  { _id: false }
);

export interface OrderDoc extends IOrder, Document {}

const orderSchema = new Schema<OrderDoc>(
  {
    orderId: { type: String, unique: true },
    paymentId: { type: String },
    paymentType: { type: String, enum: ["ONLINE"], required: true },
    userId: { type: String, ref: "User", required: true },
    restaurantId: { type: String, ref: "Restaurant", required: true },
    riderId: { type: String, ref: "Rider", default: null },
    foodItems: [FoodItemSchema],
    pricing: PricingSchema,
    location: LocationSchema,
    orderStatus: {
      type: String,
      enum: [
        "PENDING",
        "CONFIRMED",
        "ASSIGNED",
        "IN_TRANSIT",
        "DELIVERED",
        "CANCELLED",
        "FAILED",
      ],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

addCustomIdHook(orderSchema, "orderId", "ord", "Order");

export const OrderModel: Model<OrderDoc> = model<OrderDoc>("Order", orderSchema); 