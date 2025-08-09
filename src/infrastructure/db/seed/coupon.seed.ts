import mongoose from "mongoose";
import { CouponModel } from "../mongoose/schemas/coupon.schema.js";
import { config } from "../../../config/env.js";

const MONGO_URI = config.mongoUri;

const sampleCoupons = [
  {
    title: "Welcome Discount",
    code: "WELCOME50",
    type: "PERCENTAGE",
    discountValue: 50,
    limit: "unlimited",
    count: 0,
    minOrderValue: 200,
    isActive: true,
    description: "Get 50% off on your first order above ₹200"
  },
  {
    title: "Flat Discount",
    code: "FLAT100",
    type: "FIXED",
    discountValue: 100,
    limit: 100,
    count: 0,
    minOrderValue: 500,
    isActive: true,
    description: "Get ₹100 off on orders above ₹500"
  },
  {
    title: "Weekend Special",
    code: "WEEKEND25",
    type: "PERCENTAGE",
    discountValue: 25,
    limit: 50,
    count: 0,
    minOrderValue: 300,
    isActive: true,
    description: "25% off on weekend orders above ₹300"
  },
  {
    title: "New User Bonus",
    code: "NEWUSER75",
    type: "FIXED",
    discountValue: 75,
    limit: "unlimited",
    count: 0,
    minOrderValue: 150,
    isActive: true,
    description: "₹75 off for new users on orders above ₹150"
  }
];

async function seedCoupons() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("MongoDB connected");

        // Optional: clear existing coupons
        await CouponModel.deleteMany({});
        console.log("Old coupons cleared");

        await Promise.all(
            sampleCoupons.map((data) => new CouponModel(data).save())
        );

        console.log("Coupons seeded successfully");

        await mongoose.disconnect();
    } catch (error) {
        console.error("Error seeding coupons:", error);
    }
}

seedCoupons();



