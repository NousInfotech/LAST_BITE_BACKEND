import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { addCustomIdHook } from "../../../../utils/addCustomIdHook.js";
import { addressSchema, fcmSchema } from "./utils.schema.js";
import { IAddress } from "../../../../domain/interfaces/utils.interface.js";
import { Favourites, IUser, IUserCart, IUserCollection } from "../../../../domain/interfaces/user.interface.js";

// -------------------------
// User Document Interface
// -------------------------
export interface UserDoc extends IUser, Document {
  addresses?: Types.DocumentArray<IAddress & Document>;
}

// -------------------------
// Favourites Schema
// -------------------------
const FavouritesSchema = new Schema<Favourites>(
  {
    restaurants: [{ type: String }],
    foodItems: [{ type: String }],
  },
  { _id: false, timestamps: true }
);
// -------------------------
// Cart Schema
// ------------------------

const CartSchema = new Schema<IUserCart>(
  {
    foodItemId: { type: String, required: true, unique: true },
    quantity: { type: Number, required: true }
  },
  { _id: false, timestamps: true }
)

// -------------------------
// User Schema
// -------------------------
const userSchema = new Schema<UserDoc>(
  {
    userId: { type: String, unique: true },
    name: { type: String, required: true },
    fcmTokens: [fcmSchema],
    phoneNumber: { type: String, required: true },
    email: { type: String, unique: true },
    profileImage: { type: String },
    favourites: FavouritesSchema,
    cart: [{ type: CartSchema, default: [] }],
    hiddenRestaurants: [{ type: String }],
    addresses: [addressSchema],
  },
  {
    timestamps: true,
  }
);

// Add auto-generated userId
addCustomIdHook(userSchema, "userId", "usr", "User");

// -------------------------
// User Model
// -------------------------
export const UserModel: Model<UserDoc> = mongoose.model<UserDoc>("User", userSchema);

// -------------------------
// UserCollection Schema (in same file)
// -------------------------

export interface UserCollectionDoc extends Document, IUserCollection { }

const userCollectionSchema = new Schema<UserCollectionDoc>(
  {
    userId: { type: String, required: true }, // your custom user ID
    collectionId: { type: String, unique: true },
    name: { type: String, required: true },
    foodItemIds: [{ type: String, required: true }],
  },
  { timestamps: true },
);

addCustomIdHook(userCollectionSchema, "collectionId", "uci", "UserCollection");


userCollectionSchema.index({ userId: 1, name: 1 }, { unique: true });

export const UserCollectionModel: Model<UserCollectionDoc> = mongoose.model<UserCollectionDoc>(
  "UserCollection",
  userCollectionSchema
);
