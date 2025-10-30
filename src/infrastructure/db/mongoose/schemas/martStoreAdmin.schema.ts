import mongoose, { Schema, Document, Model, model } from "mongoose";
import { addCustomIdHook } from "../../../../utils/addCustomIdHook.js";
import { IMartStoreAdmin } from "../../../../domain/interfaces/martStoreAdmin.interface.js";
import { fcmSchema } from "./utils.schema.js";


export interface MartStoreAdminDoc extends IMartStoreAdmin, Document { 
  fcmTokens: Array<{
    deviceName: string;
    token: string;
    lastUpdated?: Date;
  }>;
}


const martStoreAdminSchema = new Schema<MartStoreAdminDoc>(
  {
    martStoreAdminId: { type: String, unique: true },
    martStoreId: { type: String, required: true },
    name: { type: String, required: true },
    fcmTokens: { type: [fcmSchema], default: [] },
    phoneNumber: { type: String, required: true, unique: true },
    email: { type: String, default: null },
  },
  {
    timestamps: true,
  }
);


// -------------------------
// Model with statics
// -------------------------
export interface MartStoreAdminModelType extends Model<MartStoreAdminDoc> {
  upsertFcmToken: (
    where: { martStoreAdminId?: string; phoneNumber?: string },
    payload: { token: string; deviceName: string }
  ) => Promise<{ updated: boolean; reason?: string }>;
}

const MAX_FCM_TOKENS = 5;

// -------------------------
// Indexes
// -------------------------
martStoreAdminSchema.index(
  { "fcmTokens.token": 1 },
  { unique: true, sparse: true, partialFilterExpression: { "fcmTokens.token": { $type: "string" } } }
);

// -------------------------
// Statics
// -------------------------
martStoreAdminSchema.statics.upsertFcmToken = async function (
  this: Model<MartStoreAdminDoc>,
  where: { martStoreAdminId?: string; phoneNumber?: string },
  payload: { token: string; deviceName: string }
): Promise<{ updated: boolean; reason?: string }> {
  const query: Record<string, any> = {};
  if (where.martStoreAdminId) query.martStoreAdminId = where.martStoreAdminId;
  if (where.phoneNumber) query.phoneNumber = where.phoneNumber;

  const admin = await this.findOne(query).select("_id fcmTokens");
  if (!admin) return { updated: false, reason: "MART_STORE_ADMIN_NOT_FOUND" };

  const tokens = admin.fcmTokens || [];
  const idx = tokens.findIndex((t: any) => t.token === payload.token);

  if (idx >= 0) {
    tokens[idx].deviceName = payload.deviceName;
    tokens[idx].lastUpdated = new Date();
  } else {
    tokens.push({ token: payload.token, deviceName: payload.deviceName, lastUpdated: new Date() });

    if (tokens.length > MAX_FCM_TOKENS) {
      tokens.sort(
        (a: any, b: any) => (b.lastUpdated?.getTime?.() || 0) - (a.lastUpdated?.getTime?.() || 0)
      );
      tokens.splice(MAX_FCM_TOKENS);
    }
  }

  (admin as any).fcmTokens = tokens;
  await admin.save();
  return { updated: true };
};

addCustomIdHook(
  martStoreAdminSchema,
  "martStoreAdminId",
  "martstoread",
  "MartStoreAdminModel"
);


export const MartStoreAdminModel: MartStoreAdminModelType =
  model<MartStoreAdminDoc, MartStoreAdminModelType>("MartStoreAdmin", martStoreAdminSchema, "martstoreadminadmins");
