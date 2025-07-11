import { FilterQuery, UpdateQuery } from "mongoose";
import { IAddressGeo, IRestaurant } from "../../domain/interfaces/restaurant.interface.js";
import { RestaurantDoc, RestaurantModel } from "../db/mongoose/schemas/restaurant.schema.js";
import { extractQueryOptions } from "../db/helper/utils.helper.js";
import { RestaurantStatusEnum } from "../../domain/interfaces/utils.interface.js";
import { isValidStatusTransition } from "../db/helper/restaurant.helper.js";

export class RestaurantRepository {
  /**
   * Create a new restaurant
   * @param {IRestaurant} restaurantData - Restaurant data to create
   * @returns {Promise<RestaurantDoc>}
   */
  async create(restaurantData: IRestaurant) {
    const restaurant = new RestaurantModel(restaurantData);
    return await restaurant.save();
  }

  /**
   * Find a restaurant by its restaurantId
   * @param {string} restaurantId - Custom restaurantId to search for
   * @returns {Promise<RestaurantDoc | null>}
   */
  async findByRestaurantId(restaurantId: string) {
    return await RestaurantModel.findOne({ restaurantId }, { _id: 0, __v: 0 }).lean();
  }

  async getRestaurantLocationById(restaurantId: string): Promise<IAddressGeo> {
    const restaurant = await RestaurantModel.findOne(
      { restaurantId },
      { _id: 0, address: 1 }
    ).lean();
    
    return restaurant?.address as IAddressGeo;
  }


  /**
 * Get only the packagingCharges of a restaurant by its restaurantId
 * @param {string} restaurantId
 * @returns {Promise<number | null>}
 */
  async getPackagingChargesByRestaurantId(restaurantId: string): Promise<number | null> {
    const restaurant = await RestaurantModel.findOne(
      { restaurantId },
      { _id: 0, packagingCharges: 1 } // ✅ only fetch packagingCharges
    ).lean();

    return restaurant?.packagingCharges ?? null;
  }



  /**
   * Update a restaurant by its restaurantId
   * @param {string} restaurantId - Custom restaurantId to update
   * @param {UpdateQuery<IRestaurant>} updateData - Data to update
   * @returns {Promise<RestaurantDoc | null>}
   */
  async updateRestaurant(restaurantId: string, updateData: UpdateQuery<IRestaurant>) {
    return await RestaurantModel.findOneAndUpdate({ restaurantId }, updateData, { new: true });
  }

  /**
 * Update the restaurantStatus of a restaurant by its restaurantId
 * 
 * @param {string} restaurantId - The custom restaurantId of the restaurant to update
 * @param {AdminStatusEnum} status - New admin status to set (e.g., VERIFIED, REJECTED)
 * @param {string} [message] - Optional message or reason for the status update
 * @returns {Promise<IRestaurant | null>} - The updated restaurant document or null if not found
 *
 * @throws {Error} If the provided status is not a valid AdminStatusEnum value
 */

  async updateRestaurantStatus(
    restaurantId: string,
    status: RestaurantStatusEnum,
    message?: string,
    days?: number // Add this explicitly for suspension
  ): Promise<IRestaurant | null> {
    // Validate status
    if (!Object.values(RestaurantStatusEnum).includes(status)) {
      throw new Error(`Invalid restaurant status: ${status}`);
    }

    // Fetch existing restaurant
    const restaurant = await RestaurantModel.findOne({ restaurantId }).lean();

    if (!restaurant) {
      throw new Error(`Restaurant not found for ID: ${restaurantId}`);
    }

    const currentStatus = restaurant?.restaurantStatus?.status as RestaurantStatusEnum | undefined;

    // Validate transition
    if (!isValidStatusTransition(currentStatus, status)) {
      throw new Error(`Invalid transition from ${currentStatus ?? "UNSET"} to ${status}`);
    }

    // Prepare update object
    const updateData: any = {
      "restaurantStatus.status": status,
      "restaurantStatus.updatedAt": new Date().toISOString(),
    };

    if (message) updateData["restaurantStatus.message"] = message;

    // Add `days` only if suspended
    if (status === RestaurantStatusEnum.SUSPENDED) {
      if (!days || typeof days !== "number" || days < 1) {
        throw new Error("Suspension must include a valid number of days.");
      }
      updateData["restaurantStatus.days"] = days;
    } else {
      // Clean up previous suspension fields (if any)
      updateData["restaurantStatus.days"] = undefined;
    }

    // Perform DB update
    return await RestaurantModel.findOneAndUpdate(
      { restaurantId },
      { $set: updateData },
      { new: true }
    );
  }


  /**
   * Delete a restaurant by its restaurantId
   * @param {string} restaurantId - Custom restaurantId to delete
   * @returns {Promise<RestaurantDoc | null>}
   */
  async deleteRestaurant(restaurantId: string) {
    return await RestaurantModel.findOneAndDelete({ restaurantId });
  }

  /**
   * Get all restaurants with optional filter
   * @param {FilterQuery<IRestaurant>} [filter={}] - Mongoose filter object
   * @returns {Promise<RestaurantDoc[]>}
   */
  async getAllRestaurants(filter: FilterQuery<IRestaurant> & Record<string, any> = {}) {
    // Extract query options from filter (pagination, sorting)
    const { sortBy, order, page, limit, search, ...pureFilter } = filter;

    // Build MongoDB filter object
    if (search) {
      pureFilter.restaurantName = { $regex: `^${search}`, $options: "i" };
    }

    // Extract pagination/sorting options
    const queryOptions = extractQueryOptions({ sortBy, order, page, limit });

    return await RestaurantModel.find(pureFilter, { _id: 0, __v: 0 })
      .sort(queryOptions.sort)
      .skip(queryOptions.skip || 0)
      .limit(queryOptions.limit || 10)
      .lean();
  }

  /**
   * Bulk insert multiple restaurants
   * @param {IRestaurant[]} restaurants - Array of restaurant data
   * @returns {Promise<RestaurantDoc[]>}
   */
  async bulkCreate(restaurants: IRestaurant[]) {
    return await RestaurantModel.insertMany(restaurants, { ordered: false });
  }

  /**
   * Bulk fetch restaurants by restaurantIds
   * @param {string[]} restaurantIds - Array of custom restaurantIds
   * @returns {Promise<RestaurantDoc[]>}
   */
  async bulkGetByRestaurantIds(restaurantIds: string[]) {
    return await RestaurantModel.find({ restaurantId: { $in: restaurantIds } }, { _id: 0, __v: 0 }).lean();
  }
}
