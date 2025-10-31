import { FilterQuery, UpdateQuery } from "mongoose";
import { MartStoreAdminModel } from "../db/mongoose/schemas/martStoreAdmin.schema.js";
import { IMartStoreAdmin } from "../../domain/interfaces/martStoreAdmin.interface.js";
import { IFCM } from "../../domain/interfaces/notification.interface.js";

export class MartStoreAdminRepository {
    /** Create a new mart store admin */
    async create(adminData: IMartStoreAdmin) {
        console.log("🔍 Repository: Creating MartStoreAdmin with data:", adminData);
        const admin = new MartStoreAdminModel(adminData);
        const savedAdmin = await admin.save();
        console.log("🔍 Repository: Saved MartStoreAdmin:", savedAdmin);
        return savedAdmin;
    }

    /** Get mart store admin by ID */
    async findByMartStoreAdminId(martStoreAdminId: string) {
        console.log(`🔍 Repository: Searching for MartStoreAdmin with ID: ${martStoreAdminId}`);
        const result = await MartStoreAdminModel.findOne({ martStoreAdminId }, { _id: 0, __v: 0 }).lean();
        console.log(`🔍 Repository: Query result:`, result);
        return result;
    }
    /** Get mart store admin by phone number */
    async findByMartStoreAdminPhoneNumber(phoneNumber: string) {
        return await MartStoreAdminModel.findOne({ phoneNumber }, { _id: 0, __v: 0 }).lean();
    }

    /** Get mart store admin by mart store ID */
    async findByMartStoreAdminByMartStoreId(martStoreId: string) {
        console.log(`🔍 Repository: Searching for MartStoreAdmin with martStoreId: ${martStoreId}`);
        const result = await MartStoreAdminModel.findOne({ martStoreId }, { _id: 0, __v: 0 }).lean();
        console.log(`🔍 Repository: Query result:`, result);
        return result;
    }

    /** Update mart store admin */
    async updateAdmin(martStoreAdminId: string, updateData: UpdateQuery<IMartStoreAdmin>) {
        return await MartStoreAdminModel.findOneAndUpdate({ martStoreAdminId }, updateData, { new: true });
    }

    /** Delete mart store admin */
    async deleteAdmin(martStoreAdminId: string) {
        return await MartStoreAdminModel.findOneAndDelete({ martStoreAdminId });
    }

    /** Get all mart store admins with optional filters */
    async getAllAdmins(filter: FilterQuery<IMartStoreAdmin> = {}) {
        return await MartStoreAdminModel.find(filter, { _id: 0, __v: 0 }).lean();
    }

    /** Bulk insert mart store admins */
    async bulkCreate(admins: IMartStoreAdmin[]) {
        return await MartStoreAdminModel.insertMany(admins, { ordered: false });
    }

    /** Bulk fetch by adminIds */
    async bulkGetByAdminIds(adminIds: string[]) {
        return await MartStoreAdminModel.find({ martStoreAdminId: { $in: adminIds } }, { _id: 0, __v: 0 }).lean();
    }

    /** Update FCM token for mart store admin */
    async updateFCMToken(adminId: string, fcmToken: IFCM) {
        const admin = await MartStoreAdminModel.findOne({ martStoreAdminId: adminId });
        if (!admin) throw new Error("Mart store admin not found");

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
            const result = await MartStoreAdminModel.updateOne(
                { "fcmTokens.token": tokenValue },
                { $pull: { fcmTokens: { token: tokenValue } } }
            );
            return result.modifiedCount > 0;
        } catch (error) {
            console.error("❌ Error removing FCM token from mart store admin:", error);
            return false;
        }
    }
}
