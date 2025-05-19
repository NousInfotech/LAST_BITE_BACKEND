import { FilterQuery, UpdateQuery } from "mongoose";
import { IFoodItem } from "../../domain/interfaces/foodItem.interface.js";
import { FoodItemDoc, FoodItemModel } from "../db/mongoose/schemas/foodItem.schema.js";

export class FoodItemRepository {
  /**
   * Create a new food item
   * @param {IFoodItem} foodItemData - Food item data to create
   * @returns {Promise<FoodItemDoc>}
   */
  async create(foodItemData: IFoodItem): Promise<FoodItemDoc> {
    const foodItem = new FoodItemModel(foodItemData);
    return await foodItem.save();
  }

  /**
   * Find a food item by its foodItemId
   * @param {string} foodItemId - Custom foodItemId to search for
   * @returns {Promise<FoodItemDoc | null>}
   */
  async findByFoodItemId(foodItemId: string): Promise<FoodItemDoc | null> {
    return await FoodItemModel.findOne({ foodItemId }, { _id: 0, __v: 0 }).lean();
  }

  /**
   * Update a food item by its foodItemId
   * @param {string} foodItemId - Custom foodItemId to update
   * @param {UpdateQuery<IFoodItem>} updateData - Data to update
   * @returns {Promise<FoodItemDoc | null>}
   */
  async updateFoodItem(foodItemId: string, updateData: UpdateQuery<IFoodItem>): Promise<FoodItemDoc | null> {
    return await FoodItemModel.findOneAndUpdate({ foodItemId }, updateData, { new: true });
  }

  /**
   * Delete a food item by its foodItemId
   * @param {string} foodItemId - Custom foodItemId to delete
   * @returns {Promise<FoodItemDoc | null>}
   */
  async deleteFoodItem(foodItemId: string): Promise<FoodItemDoc | null> {
    return await FoodItemModel.findOneAndDelete({ foodItemId });
  }

  /**
   * Get all food items with optional filter
   * @param {FilterQuery<IFoodItem>} [filter={}] - Mongoose filter object
   * @returns {Promise<FoodItemDoc[]>}
   */
  async getAllFoodItems(filter: FilterQuery<IFoodItem> = {}): Promise<FoodItemDoc[]> {
    return await FoodItemModel.find(filter, { _id: 0, __v: 0 }).lean();
  }

  /**
   * Bulk create food items
   * @param {IFoodItem[]} foodItems - Array of food items to insert
   * @returns {Promise<FoodItemDoc[]>}
   */
  async bulkCreate(foodItems: IFoodItem[]): Promise<FoodItemDoc[]> {
    return await FoodItemModel.insertMany(foodItems, { ordered: false });
  }

  /**
   * Bulk fetch food items by foodItemIds
   * @param {string[]} foodItemIds - Array of foodItemIds
   * @returns {Promise<FoodItemDoc[]>}
   */
  async bulkGetByFoodItemIds(foodItemIds: string[]): Promise<FoodItemDoc[]> {
    return await FoodItemModel.find({ foodItemId: { $in: foodItemIds } }, { _id: 0, __v: 0 }).lean();
  }

  /**
   * Get all food items by restaurantId
   * @param {string} restaurantId - Restaurant ID
   * @returns {Promise<FoodItemDoc[]>}
   */
  async getByRestaurantId(restaurantId: string): Promise<FoodItemDoc[]> {
    return await FoodItemModel.find({ restaurantId }, { _id: 0, __v: 0 }).lean();
  }
}
