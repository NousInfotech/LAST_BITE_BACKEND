import mongoose from "mongoose";
import { config } from "../../../config/env.js";
import { FoodItemModel } from "../mongoose/schemas/foodItem.schema.js";
import foodItemsSeedData from "./data/fooditems.json" assert { type: "json" };

const MONGO_URI = config.mongoUri;


async function seedFoodItems() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("MongoDB connected");

        // Optional: clear existing food items
        await FoodItemModel.deleteMany({});
        console.log("Old food items cleared");

        await Promise.all(
            foodItemsSeedData.map((item) => new FoodItemModel(item).save())
        );

        console.log("Food items seeded successfully");

        await mongoose.disconnect();
    } catch (error) {
        console.error("Error seeding food items:", error);
    }
}

seedFoodItems();
