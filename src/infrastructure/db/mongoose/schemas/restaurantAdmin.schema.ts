import mongoose, { Schema, model } from "mongoose";
import { addCustomIdHook } from "../../../../utils/addCustomIdHook.js";

const restaurantAdminSchema = new Schema(
  {
    restaurantAdminId: { type: String, required: true, unique: true },
    restaurantId: { type: String, required: true, ref: "Restaurant" },
    name: { type: String, required: true },
    phoneNumber: { type: String, required: true, unique: true },
    email: { type: String, default: null },
  },
  {
    timestamps: true,
  }
);

addCustomIdHook(restaurantAdminSchema, "restaurantAdminId", "resad", "RestaurantAdminModel");

export const RestaurantAdmin = mongoose.model("RestaurantAdmin", restaurantAdminSchema);
