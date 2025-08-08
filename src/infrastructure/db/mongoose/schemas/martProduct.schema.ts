import { Schema, model, Document, Model } from "mongoose";
import { IMartProduct } from "../../../../domain/interfaces/martProduct.interface.js";
import { addCustomIdHook } from "../../../../utils/addCustomIdHook.js";

const martProductSchema = new Schema<MartProductDoc>(
    {
        martProductId: { type: String, unique: true },
        martStoreId: { type: String, required: true },
        productName: { type: String, required: true },
        description: { type: String },
        price: { type: Number, required: true },
        discountPrice: { type: Number },
        image: { type: String },
        isAvailable: { type: Boolean, required: true },
        unit: { type: String, required: true },
        categories: [{ type: String, required: true }],
        stock: { type: Number },
        rating: { type: Number },
        ratingCount: { type: Number },
        tags: [{ type: String }],
    },
    {
        timestamps: true,
    }
);

// Attach the pre-save hook for customId generation
addCustomIdHook(martProductSchema, "martProductId", "mart", "MartProductModel");

// Interface for the Mongoose document
export interface MartProductDoc extends IMartProduct, Document { }

// Mongoose model
export const MartProductModel: Model<MartProductDoc> = model<MartProductDoc>(
    "MartProduct",
    martProductSchema
);
