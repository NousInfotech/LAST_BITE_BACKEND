import { Schema, Document, Model, model } from "mongoose";
import { addCustomIdHook } from "../../../../utils/addCustomIdHook.js";
import { RestaurantStatusEnum, Days } from "../../../../domain/interfaces/utils.interface.js";
import { IRestaurant } from "../../../../domain/interfaces/restaurant.interface.js";
import { FoodType } from "../../../../domain/interfaces/utils.interface.js";
import { addressSchemaGeo } from "./utils.schema.js";

// ——— Document sub‑schema (unchanged) ———
const documentSchema = new Schema(
  {
    panNumber: String,
    panImage: String,
    shopLicenseImage: String,
    fssaiCertificateNumber: String,
    fssaiCertificateImage: String,
    gstinNumber: String,
    gstCertificateImage: String,
    cancelledChequeImage: String,
    bankIFSC: String,
    bankAccountNumber: String,
  },
  { _id: false, timestamps: true }
);

// ——— Timing sub‑schema (unchanged) ———
export const timingSchema = new Schema(
  {
    day: {
      type: String,
      enum: Object.values(Days),
      required: true,
    },
    shifts: [
      {
        start: { type: String, required: true },
        end: { type: String, required: true },
      },
    ],
  },
  { _id: false, timestamps: true }
);

// ——— Address sub‑schema with GeoJSON point + 2dsphere index ———

const RestaurantStatusSchema = new Schema(
  {
    status: {
      type: String,
      enum: Object.values(RestaurantStatusEnum),
      default: RestaurantStatusEnum.PENDING,
      required: true,
    },
    message: {
      type: String,
    },
    days: {
      type: Number,
      required: function (this: any) {
        return this.status === RestaurantStatusEnum.SUSPENDED;
      },
      min: [1, 'Suspension must be at least 1 day'],
      max: [365, 'Suspension cannot exceed 365 days'], // Optional
    },
    updatedAt: {
      type: Date,
      default: () => new Date(),
    },
  },
  { _id: false }
);


// ——— Top‑level Restaurant schema ———
const restaurantSchema = new Schema<RestaurantDoc>(
  {
    restaurantId: { type: String, unique: true },
    restaurantName: { type: String, required: true },
    address: addressSchemaGeo,
    documents: documentSchema,
    timings: [timingSchema],
    tags: [String],
    cuisines: [String],
    typeOfFood: {
      type: [String],
      enum: Object.values(FoodType),
      default: [],
    },

    profilePhoto: String,
    menuImages: [String],
    isActive: { type: Boolean, default: false },
    availableCategories: {
      type: [String],
      default: [],
      required: true
    },
    restaurantStatus: { type: RestaurantStatusSchema, default: () => ({ status: RestaurantStatusEnum.PENDING }), updatedAt: new Date() },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 3.5,
    },

  },
  { timestamps: true }
);

addCustomIdHook(restaurantSchema, "restaurantId", "res", "RestaurantModel");



export interface RestaurantDoc extends IRestaurant, Document { }

export const RestaurantModel: Model<RestaurantDoc> = model<RestaurantDoc>(
  "Restaurant",
  restaurantSchema
);
