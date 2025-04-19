import mongoose, { Schema, model } from "mongoose";
import { addCustomIdHook } from "../../../../utils/addCustomIdHook.js";
import { addressSchema } from "./utils.schema.js";


const riderSchema = new Schema(
    {
        riderId: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        phoneNumber: { type: String, required: true, unique: true },
        email: { type: String, default: null },
        dateOfBirth: { type: String },
        address: addressSchema,
        vehicleType: { type: String, enum: ["bike", "scooter", "car"], required: true },
        vehicleNumber: { type: String },
        licenseNumber: { type: String },
        aadharNumber: { type: String },
        profilePhoto: { type: String },
        documentProofs: [{ type: String }],
        isVerified: { type: Boolean, default: false },
        isAvailable: { type: Boolean, default: true },
        lastLocation: {
            lat: Number,
            lng: Number,
        },
    },
    {
        timestamps: true,
    }
);

addCustomIdHook(riderSchema, "riderId", "rid", "RiderModel");

export const RiderModel = model("Rider", riderSchema);
