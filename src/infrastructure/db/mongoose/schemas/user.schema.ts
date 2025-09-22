// src/infrastructure/db/mongoose/models/user.model.ts
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
  fcmTokens: Array<{
    deviceName: string;
    token: string;
    lastUpdated?: Date;
  }>;
}

// -------------------------
// Model with statics
// -------------------------
export interface UserModelType extends Model<UserDoc> {
  upsertFcmToken: (
    where: { userId?: string; phoneNumber?: string },
    payload: { token: string; deviceName: string }
  ) => Promise<{ updated: boolean; reason?: string }>;
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
// -------------------------
const CartSchema = new Schema<IUserCart>(
  {
    foodItemId: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true },
    restaurantId: { type: String, required: true, trim: true }
  },
  { _id: false, timestamps: true }
);

// -------------------------
// User Schema
// -------------------------
const userSchema = new Schema<UserDoc>(
  {
    userId: { type: String, unique: true },
    name: { type: String, required: true, trim: true },

    // Proper subdocument array with default
    fcmTokens: { type: [fcmSchema], default: [] },

    phoneNumber: { type: String, required: true, trim: true },
    email: { type: String, unique: true, sparse: true, trim: true },

    profileImage: { type: String, trim: true },

    favourites: FavouritesSchema,

    cart: {
      type: [CartSchema],
      default: function () { return []; },
      required: false
    },

    hiddenRestaurants: [{ type: String }],
    addresses: [addressSchema],
  },
  { timestamps: true }
);

// Add auto-generated userId
addCustomIdHook(userSchema, "userId", "usr", "User");

// -------------------------
// Hooks: cart guards
// -------------------------
userSchema.pre("save", function (next) {
  // Initialize cart as empty array if not provided or invalid
  if (!this.cart || !Array.isArray(this.cart)) {
    this.cart = [];
  } else {
    // Filter out invalid cart items
    this.cart = this.cart.filter(
      (item: any) =>
        item &&
        typeof item.foodItemId === "string" &&
        item.foodItemId.trim() !== ""
    ) as any;
  }
  next();
});

userSchema.pre("validate", function (next) {
  if (!this.cart || !Array.isArray(this.cart)) {
    this.cart = [];
  }
  next();
});

// -------------------------
// Indexes & index safety
// -------------------------

// Ensure no unique indexes are created on cart.foodItemId
userSchema.index({ "cart.foodItemId": 1 }, { unique: false, sparse: true });

// Optional: keep each FCM token unique across all users (recommended)
// If you want the same device token to appear under multiple users, remove this.
userSchema.index(
  { "fcmTokens.token": 1 },
  { unique: true, sparse: true, partialFilterExpression: { "fcmTokens.token": { $type: "string" } } }
);

// Safety message if some tooling tries to create unwanted unique index on cart items
userSchema.on("index", function (error: any) {
  if (error?.message?.includes("cart.foodItemId")) {
    console.warn(
      "Warning: Unique index on cart.foodItemId detected. This may cause issues with multiple users having empty carts."
    );
  }
});

// -------------------------
// Statics
// -------------------------

const MAX_FCM_TOKENS = 5;

export interface UserModelType extends Model<UserDoc> {
  upsertFcmToken: (
    where: { userId?: string; phoneNumber?: string },
    payload: { token: string; deviceName: string }
  ) => Promise<{ updated: boolean; reason?: string }>;
}

// IMPORTANT: `this` must be `Model<UserDoc>` here, not `UserModelType`
userSchema.statics.upsertFcmToken = async function (
  this: Model<UserDoc>,
  where: { userId?: string; phoneNumber?: string },
  payload: { token: string; deviceName: string }
): Promise<{ updated: boolean; reason?: string }> {
  const query: Record<string, any> = {};
  if (where.userId) query.userId = where.userId;
  if (where.phoneNumber) query.phoneNumber = where.phoneNumber;

  const user = await this.findOne(query).select("_id fcmTokens");
  if (!user) return { updated: false, reason: "USER_NOT_FOUND" };

  const tokens = user.fcmTokens || [];
  const idx = tokens.findIndex((t: any) => t.token === payload.token);

  if (idx >= 0) {
    tokens[idx].deviceName = payload.deviceName;
    tokens[idx].lastUpdated = new Date();
  } else {
    tokens.push({
      token: payload.token,
      deviceName: payload.deviceName,
      lastUpdated: new Date(),
    });

    if (tokens.length > MAX_FCM_TOKENS) {
      tokens.sort(
        (a: any, b: any) =>
          (b.lastUpdated?.getTime?.() || 0) - (a.lastUpdated?.getTime?.() || 0)
      );
      tokens.splice(MAX_FCM_TOKENS);
    }
  }

  // assign back and save
  (user as any).fcmTokens = tokens;
  await user.save();
  return { updated: true };
};

// -------------------------
// User Model
// -------------------------
export const UserModel: UserModelType = mongoose.model<UserDoc, UserModelType>(
  "User",
  userSchema
);

// -------------------------
// UserCollection (same file)
// -------------------------
export interface UserCollectionDoc extends Document, IUserCollection {}

const userCollectionSchema = new Schema<UserCollectionDoc>(
  {
    userId: { type: String, required: true }, // your custom user ID
    collectionId: { type: String, unique: true },
    name: { type: String, required: true, trim: true },
    foodItemIds: [{ type: String, required: true }],
  },
  { timestamps: true }
);

addCustomIdHook(userCollectionSchema, "collectionId", "uci", "UserCollection");

// e.g., prevent duplicate collection names per user
userCollectionSchema.index({ userId: 1, name: 1 }, { unique: true });

export const UserCollectionModel: Model<UserCollectionDoc> =
  mongoose.model<UserCollectionDoc>("UserCollection", userCollectionSchema);
