import { Schema, Document, Model, model } from "mongoose";
import { addCustomIdHook } from "../../../../utils/addCustomIdHook.js";
import { IOrder, IOrderStatusEnum, IPaymentType, IRefIds } from "../../../../domain/interfaces/order.interface.js";

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
    additionals: { type: [AdditionalsSchema], default: [] },
  },
  { _id: false }
);

const PricingSchema = new Schema(
  {
    itemsTotal: { type: Number, required: true },
    packagingFee: { type: Number, required: true },
    deliveryFee: { type: Number, required: true },
    platformFee: { type: Number, required: true },
    tax: { type: Number, required: true },
    discount: { type: Number, default: 0 },
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

const PidgeInfoSchema = new Schema(
  {
    networkId: String,
    quoteId: String,
    price: Number,
    status: {
      type: String,
      enum: ["ASSIGNED", "IN_PROGRESS", "COMPLETED", "FAILED"],
    },
    trackingUrl: String,
  },
  { _id: false }
);

const RefIdSchema = new Schema<IRefIds>(
  {
    userId: { type: String, required: true },
    restaurantId: { type: String, required: true },
  },
  { _id: false }
)

// Main order schema
export interface OrderDoc extends IOrder, Document { }

const orderSchema = new Schema<OrderDoc>(
  {
    orderId: { type: String, unique: true },

    refIds: { type: RefIdSchema, required: true },

    foodItems: { type: [FoodItemSchema], required: true },

    pricing: { type: PricingSchema, required: true },

    delivery: {
      location: { type: LocationSchema, required: true },
      pidge: { type: PidgeInfoSchema, default: undefined },
    },

    payment: {
      paymentId: { type: String },
      paymentType: {
        type: String,
        enum: IPaymentType,
        required: true,
      },
    },

    orderStatus: {
      type: String,
      enum: Object.values(IOrderStatusEnum),
      default: IOrderStatusEnum.PENDING,
    }
    ,

    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

addCustomIdHook(orderSchema, "orderId", "ord", "Order");

export const OrderModel: Model<OrderDoc> = model<OrderDoc>("Order", orderSchema);
