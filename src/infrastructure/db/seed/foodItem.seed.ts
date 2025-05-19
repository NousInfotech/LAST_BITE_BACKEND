import mongoose from "mongoose";
import { config } from "../../../config/env.js";
import { FoodItemModel } from "../mongoose/schemas/foodItem.schema.js";
import { FoodType } from "../../../domain/interfaces/utils.interface.js";

const MONGO_URI = config.mongoUri;

const foodItemsSeedData = [
    {
        name: "Paneer Butter Masala",
        description: "A rich and creamy paneer curry made with butter and tomatoes.",
        price: 220,
        photo: "https://example.com/images/paneer-butter-masala.jpg",
        foodType: FoodType.VEG,
        category: "main-course",
        restaurantId: "res_47uMGp0W3z", // Replace with a valid ObjectId from your DB
        isAvailable: true,
    },
    {
        name: "Chicken Biryani",
        description: "Spiced chicken layered with aromatic basmati rice.",
        price: 300,
        photo: "https://example.com/images/chicken-biryani.jpg",
        foodType: FoodType.NON_VEG,
        category: "biryani",
        restaurantId: "res_47uMGp0W3z", // Replace with a valid ObjectId from your DB
        isAvailable: true,
    },
    {
        name: "Vegan Caesar Salad",
        description: "Fresh greens tossed with creamy vegan Caesar dressing.",
        price: 180,
        photo: "https://example.com/images/vegan-caesar-salad.jpg",
        foodType: FoodType.VEGAN,
        category: "salads",
        restaurantId: "res_47uMGp0W3z", // Replace with a valid ObjectId from your DB
        isAvailable: true,
    },
];

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
