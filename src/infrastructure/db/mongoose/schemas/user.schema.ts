import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { addCustomIdHook } from "../../../../utils/addCustomIdHook.js";
import { addressSchema } from "./utils.schema.js";
import { IAddress } from "../../../../domain/interfaces/utils.interface.js";


export interface UserDoc extends Document {
  userId?: string;
  name: string;
  phoneNumber: string;
  email?: string;
  profileImage?: string;
  addresses?: Types.DocumentArray<IAddress & Document>; // ✅ This is critical
  createdAt?: Date;
  updatedAt?: Date;
}


const userSchema = new Schema<UserDoc>(
  {
    userId: { type: String, unique: true },
    name: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String },
    profileImage: { type: String },
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
