import mongoose, { Schema, Document, Model, model } from "mongoose";
import { addCustomIdHook } from "../../../../utils/addCustomIdHook.js";
import { addressSchema } from "./utils.schema.js";
import { IRider, IRiderDocument } from "../../../../domain/interfaces/rider.interface.js";

export const documentsSchema = new Schema<IRiderDocument>(
  {
    vehicle: {
      vehicleNumber: { type: String, required: true },
      license: {
        number: { type: String, required: true },
        image: { type: String, required: true },
      },
      rc: {
        number: { type: String, required: true },
        images: [{ type: String, required: true }],
      },
      insurance: {
        number: { type: String, required: true },
        image: { type: String, required: true },
      },
    },
    identification: {
      aadharNumber: { type: String, required: true },
      aadharImage: { type: String, required: true },
      panNumber: {
        type: String,
        required: true,
        match: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
      },
      panImage: { type: String, required: true },
    },
    banking: {
      accountNumber: { type: String, required: true },
      ifscCode: {
        type: String,
        required: true,
        match: /^[A-Z]{4}0[A-Z0-9]{6}$/,
      },
      passbookImage: { type: String, required: true },
    },
  },
  { _id: false }
);

interface RiderDoc extends IRider, Document { }
const riderSchema = new Schema<RiderDoc>(
  {
    riderId: { type: String, unique: true },
    name: { type: String, required: true },
    phoneNumber: { type: String, required: true, unique: true },
    email: { type: String, default: null },
    dateOfBirth: { type: String },
    address: addressSchema,
    vehicleType: { type: String, enum: ["bike", "scooter", "electric-vehicle"], required: true },
    profilePhoto: { type: String },

    // ✅ New structured documents field
    documents: { type: documentsSchema, required: true },

    isVerified: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },

    lastLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
  },
  { timestamps: true }
);

// Add 2dsphere index
riderSchema.index({ lastLocation: "2dsphere" });

// Add custom ID generation hook
addCustomIdHook(riderSchema, "riderId", "rid", "RiderModel");

export const RiderModel: Model<RiderDoc> = model<RiderDoc>("Rider", riderSchema);
