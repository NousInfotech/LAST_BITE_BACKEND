import { FilterQuery, UpdateQuery } from "mongoose";
import { MartStoreAdminModel } from "../db/mongoose/schemas/martStoreAdmin.schema.js";
import { IMartStoreAdmin } from "../../domain/interfaces/martStoreAdmin.interface.js";

export class MartStoreAdminRepository {
    /** Create a new restaurant admin */
    async create(adminData: IMartStoreAdmin) {
        const admin = new MartStoreAdminModel(adminData);
        return await admin.save();
    }

    /** Get restaurant admin by ID */
    async findByMartStoreAdminId(restaurantAdminId: string) {
        return await MartStoreAdminModel.findOne({ restaurantAdminId }, { _id: 0, __v: 0 }).lean();
    }
    /** Get restaurant admin by ID */
    async findByMartStoreAdminPhoneNumber(phoneNumber: string) {
        return await MartStoreAdminModel.findOne({ phoneNumber }, { _id: 0, __v: 0 }).lean();
    }

    /** Update restaurant admin */
    async updateAdmin(restaurantAdminId: string, updateData: UpdateQuery<IMartStoreAdmin>) {
        return await MartStoreAdminModel.findOneAndUpdate({ restaurantAdminId }, updateData, { new: true });
    }

    /** Delete restaurant admin */
    async deleteAdmin(restaurantAdminId: string) {
        return await MartStoreAdminModel.findOneAndDelete({ restaurantAdminId });
    }

    /** Get all restaurant admins with optional filters */
    async getAllAdmins(filter: FilterQuery<IMartStoreAdmin> = {}) {
        return await MartStoreAdminModel.find(filter, { _id: 0, __v: 0 }).lean();
    }

    /** Bulk insert restaurant admins */
    async bulkCreate(admins: IMartStoreAdmin[]) {
        return await MartStoreAdminModel.insertMany(admins, { ordered: false });
    }

    /** Bulk fetch by adminIds */
    async bulkGetByAdminIds(adminIds: string[]) {
        return await MartStoreAdminModel.find({ restaurantAdminId: { $in: adminIds } }, { _id: 0, __v: 0 }).lean();
    }
}
