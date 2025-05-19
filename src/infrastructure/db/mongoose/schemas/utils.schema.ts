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
    { _id: true, timestamps: true }
);

export const addressSchemaGeo = new Schema(
  {
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
        required: true,
      },
      coordinates: {
        type: [Number],       // [ longitude, latitude ]
        required: true,
      },
    },
    no:          String,
    street:      String,
    area:        String,
    city:        String,
    state:       String,
    country:     String,
    fullAddress: String,
    tag:         { type: String, enum: ["home","office","friends","others"], default: "others" },
  },
  { _id: false, timestamps: true }
);
addressSchemaGeo.index({ location: "2dsphere" });
