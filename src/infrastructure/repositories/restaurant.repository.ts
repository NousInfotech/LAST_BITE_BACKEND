import { FilterQuery, UpdateQuery } from "mongoose";
import { IRestaurant } from "../../domain/interfaces/restaurant.interface.js";
import { RestaurantDoc, RestaurantModel } from "../db/mongoose/schemas/restaurant.schema.js";

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
  async getAllRestaurants(filter: FilterQuery<IRestaurant> = {}) {
    return await RestaurantModel.find(filter, { _id: 0, __v: 0 }).lean();
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
