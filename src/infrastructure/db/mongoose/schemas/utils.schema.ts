import { Schema } from "mongoose";

export const addressSchema = new Schema(
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
        tag: {
            type: String,
            enum: ["home", "office", "friends", "others"],
            default: "others",
        },
    },
    { _id: false, timestamps: true }
);
