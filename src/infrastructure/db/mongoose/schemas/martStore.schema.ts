import { Schema, model, Model, Document } from "mongoose";
import { RestaurantStatusEnum } from "../../../../domain/interfaces/utils.interface.js";
import { addCustomIdHook } from "../../../../utils/addCustomIdHook.js";
import { IMartStore } from "../../../../domain/interfaces/martstore.interface.js";
import { addressSchemaGeo } from "./utils.schema.js";

// ---- Mart Documents Sub-Schema ----
const martDocumentsSchema = new Schema(
    {
        gstinNumber: { type: String },
        gstCertificateImage: { type: String },
        tradeLicenseNumber: { type: String },
        tradeLicenseImage: { type: String },
        cancelledChequeImage: { type: String },
        bankIFSC: { type: String },
        bankAccountNumber: { type: String },
    },
    { _id: false, timestamps: true }
);

// ---- Store Status Sub-Schema ----
const martStoreStatusSchema = new Schema(
    {
        status: {
            type: String,
            enum: Object.values(RestaurantStatusEnum),
            default: RestaurantStatusEnum.PENDING,
            required: true,
        },
        message: { type: String },
        days: {
            type: Number,
            required: function (this: any) {
                return this.status === RestaurantStatusEnum.SUSPENDED;
            },
            min: 1,
            max: 365,
        },
        updatedAt: {
            type: Date,
            default: () => new Date(),
        },
    },
    { _id: false }
);


// ---- Mart Store Main Schema ----
const martStoreSchema = new Schema<IMartStore & Document>(
    {
        martStoreId: { type: String, unique: true },
        martStoreName: { type: String, required: true },
        address: addressSchemaGeo,
        documents: martDocumentsSchema,
        isAvailable: { type: Boolean, default: true },
        storeStatus: { type: martStoreStatusSchema, default: () => ({ status: RestaurantStatusEnum.PENDING }) },
        packagingCharges: { type: Number, default: 0 },
        tags: { type: [String], default: [] },
        storeLogo: { type: String },
    },
    { timestamps: true }
);

export interface MartStoreDoc extends IMartStore, Document { }

addCustomIdHook(martStoreSchema, "martStoreId", "mart", "MartStoreModel");

export const MartStoreModel: Model<IMartStore & Document> = model<IMartStore & Document>(
    "MartStore",
    martStoreSchema
);