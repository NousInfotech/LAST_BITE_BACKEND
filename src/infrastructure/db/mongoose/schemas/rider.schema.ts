import mongoose, { Schema, Document, Model, model } from "mongoose";
import { addCustomIdHook } from "../../../../utils/addCustomIdHook.js";
import { addressSchema } from "./utils.schema.js";
import { IRider } from "../../../../domain/interfaces/rider.interface.js";


interface RiderDoc extends IRider, Document {}


const riderSchema = new Schema<RiderDoc>(
  {
    riderId:       { type: String, required: true, unique: true },
    name:          { type: String, required: true },
    phoneNumber:   { type: String, required: true, unique: true },
    email:         { type: String, default: null },
    dateOfBirth:   { type: String },
    address:       addressSchema,
    vehicleType:   { type: String, enum: ["bike", "scooter", "car"], required: true },
    vehicleNumber: { type: String },
    licenseNumber: { type: String },
    aadharNumber:  { type: String },
    profilePhoto:  { type: String },
    documentProofs:[{ type: String }],
    isVerified:    { type: Boolean, default: false },
    isAvailable:   { type: Boolean, default: true },
    
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
  {
    timestamps: true,
  }
);


riderSchema.index({ lastLocation: "2dsphere" });


addCustomIdHook(riderSchema, "riderId", "rid", "RiderModel");


export const RiderModel: Model<RiderDoc> =
  model<RiderDoc>("Rider", riderSchema);
