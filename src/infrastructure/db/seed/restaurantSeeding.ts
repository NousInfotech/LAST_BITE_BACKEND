import mongoose from "mongoose";
import { RestaurantModel } from "../mongoose/schemas/restaurant.schema.js";
import { FoodType } from "../../../domain/interfaces/restaurant.interface.js";
import { Days } from "../../../domain/interfaces/utils.interface.js";
import { config } from "../../../config/env.js";

const MONGO_URI = config.mongoUri;

const restaurantsSeedData = [
    {
        restaurantName: "Green Garden",
        address: {
            location: {
                type: "Point",
                coordinates: [77.5946, 12.9716],
            },
            no: "123",
            street: "MG Road",
            area: "Central",
            city: "Bangalore",
            state: "Karnataka",
            country: "India",
            fullAddress: "123 MG Road, Central, Bangalore, Karnataka, India",
            tag: "office",
        },
        documents: {
            panNumber: "ABCDE1234F",
            panImage: "pan-image-url",
            shopLicenseImage: "license-image-url",
            fssaiCertificateNumber: "FSSAI123456",
            fssaiCertificateImage: "fssai-image-url",
            gstinNumber: "29ABCDE1234F1Z5",
            gstCertificateImage: "gst-image-url",
            cancelledChequeImage: "cheque-image-url",
            bankIFSC: "SBIN0001234",
            bankAccountNumber: "1234567890",
        },
        timings: [
            {
                day: Days.MONDAY,
                shifts: [
                    { start: "10:00", end: "14:00" },
                    { start: "18:00", end: "22:00" },
                ],
            },
            {
                day: Days.TUESDAY,
                shifts: [{ start: "10:00", end: "22:00" }],
            },
        ],
        tags: ["organic", "family-friendly"],
        cuisines: ["Indian", "Continental"],
        typeOfFood: [FoodType.VEGAN, FoodType.ORGANIC],
        profilePhoto: "https://example.com/images/green-garden.jpg",
        isActive: true,
        availableCategories: ["biryani", "salads", "desserts"],
        rating: 4.2,
    },
    // Add more restaurant objects here
];

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
