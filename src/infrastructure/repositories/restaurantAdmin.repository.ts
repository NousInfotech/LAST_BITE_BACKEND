import { FilterQuery, UpdateQuery } from "mongoose";
import { RestaurantAdminModel } from "../db/mongoose/schemas/restaurantAdmin.schema.js";
import { IRestaurantAdmin } from "../../domain/interfaces/restaurantAdmin.interface.js";

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
}
