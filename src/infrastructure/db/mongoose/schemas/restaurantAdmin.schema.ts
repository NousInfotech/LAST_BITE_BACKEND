import mongoose, { Schema, Document, Model, model } from "mongoose";
import { addCustomIdHook } from "../../../../utils/addCustomIdHook.js";
import { IRestaurantAdmin } from "../../../../domain/interfaces/restaurantAdmin.interface.js";
import { fcmSchema } from "./utils.schema.js";


export interface RestaurantAdminDoc extends IRestaurantAdmin, Document { 
   fcmTokens: Array<{
    deviceName: string;
    token: string;
    lastUpdated?: Date;
  }>;
}

// -------------------------
// Model with statics
// -------------------------
export interface RestaurantAdminModelType extends Model<RestaurantAdminDoc> {
  upsertFcmToken: (
    where: { restaurantAdminId?: string; phoneNumber?: string },
    payload: { token: string; deviceName: string }
  ) => Promise<{ updated: boolean; reason?: string }>;
}

const MAX_FCM_TOKENS = 5;


const restaurantAdminSchema = new Schema<RestaurantAdminDoc>(
  {
    restaurantAdminId: { type: String, unique: true },
    restaurantId: { type: String, required: true, ref: "Restaurant" },
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
// Indexes
// -------------------------

// Optional: keep each FCM token unique across all restaurant admins (recommended)
// If you want the same device token to appear under multiple restaurant admins, remove this.
restaurantAdminSchema.index(
  { "fcmTokens.token": 1 },
  { unique: true, sparse: true, partialFilterExpression: { "fcmTokens.token": { $type: "string" } } }
);

// -------------------------
// Statics
// -------------------------

restaurantAdminSchema.statics.upsertFcmToken = async function (
  this: Model<RestaurantAdminDoc>,
  where: { restaurantAdminId?: string; phoneNumber?: string },
  payload: { token: string; deviceName: string }
): Promise<{ updated: boolean; reason?: string }> {
  const query: Record<string, any> = {};
  if (where.restaurantAdminId) query.restaurantAdminId = where.restaurantAdminId;
  if (where.phoneNumber) query.phoneNumber = where.phoneNumber;

  const restaurantAdmin = await this.findOne(query).select("_id fcmTokens");
  if (!restaurantAdmin) return { updated: false, reason: "RESTAURANT_ADMIN_NOT_FOUND" };

  const tokens = restaurantAdmin.fcmTokens || [];
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
  (restaurantAdmin as any).fcmTokens = tokens;
  await restaurantAdmin.save();
  return { updated: true };
};



addCustomIdHook(
  restaurantAdminSchema,
  "restaurantAdminId",
  "resad",
  "RestaurantAdminModel"
);


export const RestaurantAdminModel: RestaurantAdminModelType =
  model<RestaurantAdminDoc, RestaurantAdminModelType>("RestaurantAdmin", restaurantAdminSchema);
