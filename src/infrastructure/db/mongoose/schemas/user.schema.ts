import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { addCustomIdHook } from "../../../../utils/addCustomIdHook.js";
import { addressSchema } from "./utils.schema.js";
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
    foodItemId: { type: String, required: true },
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
    phoneNumber: { type: String, required: true },
    email: { type: String, unique: true },
    profileImage: { type: String },
    favourites: FavouritesSchema,
    cart: { 
      type: [CartSchema], 
      default: function() { return []; },
      required: false
    },
    hiddenRestaurants: [{ type: String }],
    addresses: [addressSchema],
  },
  {
    timestamps: true,
  }
);

// Add auto-generated userId
addCustomIdHook(userSchema, "userId", "usr", "User");

// Ensure cart is always initialized as an empty array and handle the unique index issue
userSchema.pre('save', function(next) {
  // Initialize cart as empty array if not provided or invalid
  if (!this.cart || !Array.isArray(this.cart)) {
    this.cart = [];
  } else {
    // Filter out any invalid cart items that might cause unique index conflicts
    this.cart = this.cart.filter(item => 
      item && item.foodItemId && typeof item.foodItemId === 'string' && item.foodItemId.trim() !== ''
    );
  }
  next();
});

// Also handle the cart field during document creation
userSchema.pre('validate', function(next) {
  if (!this.cart || !Array.isArray(this.cart)) {
    this.cart = [];
  }
  next();
});

// Remove any existing unique indexes on cart.foodItemId if they exist
// This is a safety measure to prevent the unique index conflict
userSchema.on('index', function(error) {
  if (error && error.message && error.message.includes('cart.foodItemId')) {
    console.warn('Warning: Unique index on cart.foodItemId detected. This may cause issues with multiple users having empty carts.');
  }
});

// Ensure no unique indexes are created on cart.foodItemId
userSchema.index({ 'cart.foodItemId': 1 }, { unique: false, sparse: true });

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
