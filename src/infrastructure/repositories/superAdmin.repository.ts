import { FilterQuery, UpdateQuery } from "mongoose";
import { SuperAdminModel } from "../db/mongoose/schemas/superAdmin.schema.js";
import { ISuperAdmin } from "../../domain/interfaces/superAdmin.interface.js";

export class SuperAdminRepository {
    /** Create a new super admin */
    async create(superAdminData: ISuperAdmin) {
        const existingCount = await SuperAdminModel.countDocuments();
        if (existingCount >= 1) {
            throw new Error("Only one superAdmin is allowed.");
        }

        const admin = new SuperAdminModel(superAdminData);
        return await admin.save();
    }


    /** Get a super admin by ID */
    async findBySuperAdminId(superAdminId: string) {
        return await SuperAdminModel.findOne({ superAdminId }, { _id: 0, __v: 0 }).lean();
    }

    /** Get a super admin by email */
    async findByEmail(email: string) {
        return await SuperAdminModel.findOne({ email }, { _id: 0, __v: 0 });
    }

    /** Update super admin */
    async update(superAdminId: string, updateData: UpdateQuery<ISuperAdmin>) {
        return await SuperAdminModel.findOneAndUpdate({ superAdminId }, updateData, { new: true });
    }

    /** Delete super admin */
    async delete(superAdminId: string) {
        return await SuperAdminModel.findOneAndDelete({ superAdminId });
    }

    /** Get all (should normally be only 1) */
    async getAll(filter: FilterQuery<ISuperAdmin> = {}) {
        return await SuperAdminModel.find(filter, { _id: 0, __v: 0 }).lean();
    }
}
