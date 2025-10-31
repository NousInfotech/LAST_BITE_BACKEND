import { FilterQuery, UpdateQuery } from "mongoose";
import { RestaurantAdminModel } from "../db/mongoose/schemas/restaurantAdmin.schema.js";
import { IRestaurantAdmin } from "../../domain/interfaces/restaurantAdmin.interface.js";
import { IFCM } from "../../domain/interfaces/notification.interface.js";

export class RestaurantAdminRepository {
    /** Create a new restaurant admin */
    async create(adminData: IRestaurantAdmin) {
        const admin = new RestaurantAdminModel(adminData);
        return await admin.save();
    }

    /** Get restaurant admin by ID */
    async findByRestaurantAdminId(restaurantAdminId: string) {
        return await RestaurantAdminModel.findOne({ restaurantAdminId }, { _id: 0, __v: 0 }).lean();
    }

    async findByRestaurantAdminByRestaurantId(restaurantId: string) {
        return await RestaurantAdminModel.findOne({ restaurantId }, { _id: 0, __v: 0 }).lean();
    }

    /** Get restaurant admin by ID */
    async findByRestaurantAdminPhoneNumber(phoneNumber: string) {
        return await RestaurantAdminModel.findOne({ phoneNumber }, { _id: 0, __v: 0 }).lean();
    }

    /** Update restaurant admin */
    async updateAdmin(restaurantAdminId: string, updateData: UpdateQuery<IRestaurantAdmin>) {
        return await RestaurantAdminModel.findOneAndUpdate({ restaurantAdminId }, updateData, { new: true });
    }

    /** Delete restaurant admin */
    async deleteAdmin(restaurantAdminId: string) {
        return await RestaurantAdminModel.findOneAndDelete({ restaurantAdminId });
    }

    /** Get all restaurant admins with optional filters */
    async getAllAdmins(filter: FilterQuery<IRestaurantAdmin> = {}) {
        return await RestaurantAdminModel.find(filter, { _id: 0, __v: 0 }).lean();
    }

    /** Bulk insert restaurant admins */
    async bulkCreate(admins: IRestaurantAdmin[]) {
        return await RestaurantAdminModel.insertMany(admins, { ordered: false });
    }

    /** Bulk fetch by adminIds */
    async bulkGetByAdminIds(adminIds: string[]) {
        return await RestaurantAdminModel.find({ restaurantAdminId: { $in: adminIds } }, { _id: 0, __v: 0 }).lean();
    }
    async updateFCMToken(adminId: string, fcmToken: IFCM) {
        const admin = await RestaurantAdminModel.findOne({ restaurantAdminId: adminId });
        if (!admin) throw new Error("Restaurant admin not found");

        if (!admin.fcmTokens) {
            admin.fcmTokens = [];
        }

        const existingIndex = admin.fcmTokens.findIndex(
            (token) => token.deviceName === fcmToken.deviceName
        );

        if (existingIndex !== -1) {
            admin.fcmTokens[existingIndex].token = fcmToken.token;
            admin.fcmTokens[existingIndex].lastUpdated = new Date();
        } else {
            admin.fcmTokens.push({
                ...fcmToken,
                lastUpdated: new Date()
            });
        }

        await admin.save();
        return admin.fcmTokens;
    }

    /** Remove FCM token by token value */
    async removeFCMToken(tokenValue: string): Promise<boolean> {
        try {
            const result = await RestaurantAdminModel.updateOne(
                { "fcmTokens.token": tokenValue },
                { $pull: { fcmTokens: { token: tokenValue } } }
            );
            return result.modifiedCount > 0;
        } catch (error) {
            console.error("❌ Error removing FCM token from restaurant admin:", error);
            return false;
        }
    }


}
