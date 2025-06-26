import mongoose, { Schema, Document, Model, model } from "mongoose";
import { addCustomIdHook } from "../../../../utils/addCustomIdHook.js";
import { IRestaurantAdmin } from "../../../../domain/interfaces/restaurantAdmin.interface.js";


interface RestaurantAdminDoc extends IRestaurantAdmin, Document { }


const restaurantAdminSchema = new Schema<RestaurantAdminDoc>(
  {
    restaurantAdminId: { type: String, unique: true },
    restaurantId: { type: String, required: true, ref: "Restaurant" },
    name: { type: String, required: true },
    phoneNumber: { type: String, required: true, unique: true },
    email: { type: String, default: null },
  },
  {
    timestamps: true,
  }
);


addCustomIdHook(
  restaurantAdminSchema,
  "restaurantAdminId",
  "resad",
  "RestaurantAdminModel"
);


export const RestaurantAdminModel: Model<RestaurantAdminDoc> =
  model<RestaurantAdminDoc>("RestaurantAdmin", restaurantAdminSchema);
