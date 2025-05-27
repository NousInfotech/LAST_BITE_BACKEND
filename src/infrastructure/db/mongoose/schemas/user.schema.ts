import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { addCustomIdHook } from "../../../../utils/addCustomIdHook.js";
import { addressSchema } from "./utils.schema.js";
import { IAddress } from "../../../../domain/interfaces/utils.interface.js";
import { IUser } from "../../../../domain/interfaces/user.interface.js";

export interface UserDoc extends IUser, Document {
  addresses?: Types.DocumentArray<IAddress & Document>;
}


const userSchema = new Schema<UserDoc>(
  {
    userId: { type: String, unique: true },
    name: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String },
    profileImage: { type: String },
    favourites: [{ type: String }], // store restaurantIds
    addresses: [addressSchema],
  },
  {
    timestamps: true,
  }
);

// Add auto-generated userId hook (like usr_abc123)
addCustomIdHook(userSchema, "userId", "usr", "User");

// Export model
export const UserModel: Model<UserDoc> = mongoose.model<UserDoc>("User", userSchema);
