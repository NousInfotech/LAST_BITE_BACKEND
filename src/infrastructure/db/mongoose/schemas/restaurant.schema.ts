import mongoose, { Schema } from "mongoose";
import { addCustomIdHook } from "../../../../utils/addCustomIdHook.js";

const documentSchema = new Schema(
    {
        panNumber: { type: String },
        panImage: { type: String },
        shopLicenseImage: { type: String },
        fssaiCertificateNumber: { type: String },
        fssaiCertificateImage: { type: String },
        gstinNumber: { type: String },
        gstCertificateImage: { type: String },
        cancelledChequeImage: { type: String },
        bankIFSC: { type: String },
        bankAccountNumber: { type: String },
    },
    { _id: false, timestamps: true }
);

const timingSchema = new Schema(
    {
        day: { type: String },
        shifts: [
            {
                start: { type: String }, // HH:mm
                end: { type: String },
            },
        ],
    },
    { _id: false, timestamps: true }
);

const addressSchema = new Schema(
    {
        latitude: { type: Number },
        longitude: { type: Number },
        no: { type: String },
        street: { type: String },
        area: { type: String },
        city: { type: String },
        state: { type: String },
        country: { type: String },
        fullAddress: { type: String },
    },
    { _id: false, timestamps: true }
);

const restaurantSchema = new Schema(
    {
        restaurantId: { type: String, unique: true },
        restaurantName: { type: String, required: true },
        address: addressSchema,
        documents: documentSchema,
        timings: [timingSchema],
        tags: [{ type: String }],
        cuisines: [{ type: String }],
        typeOfFood: { type: String }, // optional: "veg", "non-veg", "halal"
        profilePhoto: { type: String },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

addCustomIdHook(restaurantSchema, "restaurantId", "res", "RestaurantModel");

export const RestaurantModel = mongoose.model("Restaurant", restaurantSchema);