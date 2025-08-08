import { FilterQuery, UpdateQuery } from "mongoose";
import { MartStoreAdminModel } from "../db/mongoose/schemas/martStoreAdmin.schema.js";
import { IMartStoreAdmin } from "../../domain/interfaces/martStoreAdmin.interface.js";

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
}
