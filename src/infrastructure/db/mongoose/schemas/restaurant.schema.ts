import { Schema, Document, Model, model } from "mongoose";
import { addCustomIdHook } from "../../../../utils/addCustomIdHook.js";
import { Days } from "../../../../domain/interfaces/utils.interface.js";
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
