import mongoose from "mongoose";
import { RestaurantModel } from "../mongoose/schemas/restaurant.schema.js";
import { FoodType } from "../../../domain/interfaces/utils.interface.js";
import { Days } from "../../../domain/interfaces/utils.interface.js";
import { config } from "../../../config/env.js";
import restaurantsSeedData from "./data/restaurants.json" assert { type: "json" };


const MONGO_URI = config.mongoUri;



async function seedRestaurants() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("MongoDB connected");

        // Optional: clear existing restaurants
        await RestaurantModel.deleteMany({});
        console.log("Old restaurants cleared");

        await Promise.all(
            restaurantsSeedData.map((data) => new RestaurantModel(data).save())
        );

        console.log("Restaurants seeded successfully");

        await mongoose.disconnect();
    } catch (error) {
        console.error("Error seeding restaurants:", error);
    }
}

seedRestaurants();
