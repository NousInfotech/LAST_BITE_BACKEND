import { Schema, model, Document, Model } from "mongoose";
import { IFoodItem } from "../../../../domain/interfaces/foodItem.interface.js";
import { FoodType } from "../../../../domain/interfaces/utils.interface.js";
import { addCustomIdHook } from "../../../../utils/addCustomIdHook.js";

const addonSchema = new Schema(
    {
        name: { type: String, required: true },
        price: { type: Number, required: true },
    },
    { _id: false }
);

const foodItemSchema = new Schema<FoodItemDoc>(
    {
        foodItemId: { type: String, unique: true },
        restaurantId: { type: String, required: true },
        name: { type: String, required: true },
        description: { type: String },
        price: { type: Number, required: true },
        discountPrice: { type: Number },
        image: { type: String },
        isAvailable: { type: Boolean, default: true },
        typeOfFood: {
            type: [String],
            enum: Object.values(FoodType),
            required: true,
        },
        tags: [{ type: String }],
        category: { type: String },
        rating: { type: Number },
        ratingCount: { type: Number },
        stock: { type: Number },
        addons: [addonSchema],
    },
    { timestamps: true }
);

// ⬇️ Attach the pre-save hook for foodItemId generation
addCustomIdHook(foodItemSchema, "foodItemId", "food", "FoodItemModel");

export interface FoodItemDoc extends IFoodItem, Document { }
export const FoodItemModel: Model<FoodItemDoc> = model<FoodItemDoc>("FoodItem", foodItemSchema);
