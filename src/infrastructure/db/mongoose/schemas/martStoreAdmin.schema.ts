import mongoose, { Schema, Document, Model, model } from "mongoose";
import { addCustomIdHook } from "../../../../utils/addCustomIdHook.js";
import { IMartStoreAdmin } from "../../../../domain/interfaces/martStoreAdmin.interface.js";


interface MartStoreAdminDoc extends IMartStoreAdmin, Document { }


const martStoreAdminSchema = new Schema<MartStoreAdminDoc>(
  {
    martStoreAdminId: { type: String, unique: true },
    martStoreId: { type: String, required: true },
    name: { type: String, required: true },
    phoneNumber: { type: String, required: true, unique: true },
    email: { type: String, default: null },
  },
  {
    timestamps: true,
  }
);


addCustomIdHook(
  martStoreAdminSchema,
  "martStoreAdminId",
  "martstoread",
  "MartStoreAdminModel"
);


export const MartStoreAdminModel: Model<MartStoreAdminDoc> =
  model<MartStoreAdminDoc>("MartStoreAdmin", martStoreAdminSchema, "martstoreadminadmins");
