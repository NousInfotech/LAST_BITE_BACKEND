import mongoose, { Schema } from "mongoose";
import { addCustomIdHook } from "../../../../utils/addCustomIdHook.js";
import { addressSchema } from "./utils.schema.js";

const userSchema = new Schema(
    {
        userId: { type: String, unique: true },
        name: { type: String, required: true },
        phoneNumber: { type: String, required: true },
        email: { type: String },
        firebaseId: { type: String, required: true },
        profileImage: { type: String },
        addresses: [addressSchema],
    },
    { timestamps: true }
);

// Pre-hook to auto-generate userId like "usr_abc123"
addCustomIdHook(userSchema, "userId", "usr", "UserModel");

export const UserModel = mongoose.model("User", userSchema);
