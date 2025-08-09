import { Schema, Document, Model, model } from "mongoose";
import { addCustomIdHook } from "../../../../utils/addCustomIdHook.js";
import { ICouponApplied, IOrder, IOrderFeedback, IOrderStatusEnum, IPaymentType, IPidgeOrder, IRefIds } from "../../../../domain/interfaces/order.interface.js";
import { number } from "zod";

// Subschemas
const AdditionalsSchema = new Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
  },
  { _id: false }
);

const OrderFeedbackSchema = new Schema<IOrderFeedback>(
  {
    orderRating: { type: Number, required: true },
    riderRating: { type: Number },
    review: { type: String }
  },
  { _id: false }
)

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
    tax: {
      total: { type: Number, required: true },
      cgst: { type: Number, required: true },
      sgst: { type: Number, required: true },
    },
    discount: { type: Number, default: 0 },
    finalPayable: { type: Number, required: true },
    distribution: {
      platform: { type: Number, required: true },
      deliveryPartner: { type: Number, required: true },
      restaurant: { type: Number, required: true },
    },
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

const PidgeInfoSchema = new Schema<IPidgeOrder>(
  {
    pidgeId: {
      type: String,
      required: true, // Internal Pidge order ID (e.g., "1754000237925PEW8OVGI")
    },
    orderId: {
      type: String,
      required: true, // Your own system's order ID (e.g., "ORD123456")
    },
    billAmount: {
      type: Number,
      required: true, // Total delivery charge
    },
    status: {
      type: String,
      enum: ["cancelled", "pending", "fulfilled", "completed"], // Top-level status values
      required: true,
    },
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

const CouponAppliedSchema = new Schema<ICouponApplied>(
  {
    couponId: { type: String, required: true },
    code: { type: String, required: true },
    discountValue: { type: Number, required: true },
  },
  { _id: false }
);


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

    feedback: OrderFeedbackSchema,

    payment: {
      paymentId: { type: String },
      paymentType: {
        type: String,
        enum: IPaymentType,
        required: true,
      },
    },

    coupons: { type: [CouponAppliedSchema], default: [] },

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
