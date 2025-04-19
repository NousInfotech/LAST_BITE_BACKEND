import { FilterQuery, UpdateQuery } from "mongoose";
import { RiderModel } from "../db/mongoose/schemas/rider.schema.js";
import { IRider } from "../../domain/interfaces/rider.interface.js";

export class RiderRepository {
    /** Create a new rider */
    async create(riderData: IRider) {
        const rider = new RiderModel(riderData);
        return await rider.save();
    }

    /** Get a rider by riderId */
    async findByRiderId(riderId: string) {
        return await RiderModel.findOne({ riderId }, { _id: 0, __v: 0 }).lean();
    }

    /** Get a rider by phoneNumber */
    async findByRiderPhoneNumber(phoneNumber: string) {
        return await RiderModel.findOne({ phoneNumber }, { _id: 0, __v: 0 }).lean();
    }

    /** Update rider */
    async updateRider(riderId: string, updateData: UpdateQuery<IRider>) {
        return await RiderModel.findOneAndUpdate({ riderId }, updateData, { new: true });
    }

    /** Delete rider */
    async deleteRider(riderId: string) {
        return await RiderModel.findOneAndDelete({ riderId });
    }

    /** Get all riders with optional filters */
    async getAllRiders(filter: FilterQuery<IRider> = {}) {
        return await RiderModel.find(filter, { _id: 0, __v: 0 }).lean();
    }

    /** Bulk insert riders */
    async bulkCreate(riders: IRider[]) {
        return await RiderModel.insertMany(riders, { ordered: false });
    }

    /** Bulk fetch by riderIds */
    async bulkGetByRiderIds(riderIds: string[]) {
        return await RiderModel.find({ riderId: { $in: riderIds } }, { _id: 0, __v: 0 }).lean();
    }
}
