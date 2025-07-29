import { FilterQuery, UpdateQuery } from "mongoose";
import { IMartStore } from "../../domain/interfaces/martstore.interface.js";
import { MartStoreDoc, MartStoreModel } from "../db/mongoose/schemas/martStore.schema.js";
import { extractQueryOptions } from "../db/helper/utils.helper.js";
import { RestaurantStatusEnum } from "../../domain/interfaces/utils.interface.js";
import { isValidStatusTransition } from "../db/helper/restaurant.helper.js"; // can be reused if logic is the same

export class MartStoreRepository {
  async create(martStoreData: IMartStore): Promise<MartStoreDoc> {
    const martStore = new MartStoreModel(martStoreData);
    return await martStore.save();
  }

  async findByMartStoreId(martStoreId: string): Promise<MartStoreDoc | null> {
    return await MartStoreModel.findOne({ martStoreId }, { _id: 0, __v: 0 }).lean();
  }

  async getPackagingChargesByMartStoreId(martStoreId: string): Promise<number | null> {
    const store = await MartStoreModel.findOne(
      { martStoreId },
      { _id: 0, packagingCharges: 1 }
    ).lean();
    return store?.packagingCharges ?? null;
  }

  async updateMartStore(martStoreId: string, updateData: UpdateQuery<IMartStore>): Promise<MartStoreDoc | null> {
    return await MartStoreModel.findOneAndUpdate({ martStoreId }, updateData, { new: true });
  }

  async updateMartStoreStatus(
    martStoreId: string,
    status: RestaurantStatusEnum,
    message?: string,
    days?: number
  ): Promise<IMartStore | null> {
    if (!Object.values(RestaurantStatusEnum).includes(status)) {
      throw new Error(`Invalid store status: ${status}`);
    }

    const store = await MartStoreModel.findOne({ martStoreId }).lean();
    if (!store) {
      throw new Error(`Store not found for ID: ${martStoreId}`);
    }

    const currentStatus = store?.storeStatus?.status as RestaurantStatusEnum | undefined;
    if (!isValidStatusTransition(currentStatus, status)) {
      throw new Error(`Invalid transition from ${currentStatus ?? "UNSET"} to ${status}`);
    }

    const updateData: any = {
      "storeStatus.status": status,
      "storeStatus.updatedAt": new Date().toISOString(),
    };

    if (message) updateData["storeStatus.message"] = message;
    if (status === RestaurantStatusEnum.SUSPENDED) {
      if (!days || typeof days !== "number" || days < 1) {
        throw new Error("Suspension must include a valid number of days.");
      }
      updateData["storeStatus.days"] = days;
    } else {
      updateData["storeStatus.days"] = undefined;
    }

    return await MartStoreModel.findOneAndUpdate(
      { martStoreId },
      { $set: updateData },
      { new: true }
    );
  }

  async deleteMartStore(martStoreId: string): Promise<MartStoreDoc | null> {
    return await MartStoreModel.findOneAndDelete({ martStoreId });
  }

  async getAllMartStores(filter: FilterQuery<IMartStore> & Record<string, any> = {}): Promise<MartStoreDoc[]> {
    const { sortBy, order, page, limit, search, ...pureFilter } = filter;

    if (search) {
      pureFilter.martStoreName = { $regex: `^${search}`, $options: "i" };
    }

    const queryOptions = extractQueryOptions({ sortBy, order, page, limit });

    return await MartStoreModel.find(pureFilter, { _id: 0, __v: 0 })
      .sort(queryOptions.sort)
      .skip(queryOptions.skip || 0)
      .limit(queryOptions.limit || 10)
      .lean();
  }

  async bulkCreate(stores: IMartStore[]): Promise<MartStoreDoc[]> {
    return await MartStoreModel.insertMany(stores, { ordered: false });
  }

  async bulkGetByMartStoreIds(martStoreIds: string[]): Promise<MartStoreDoc[]> {
    return await MartStoreModel.find({ martStoreId: { $in: martStoreIds } }, { _id: 0, __v: 0 }).lean();
  }
}