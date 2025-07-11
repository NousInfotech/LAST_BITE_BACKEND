import { FilterQuery, UpdateQuery } from "mongoose";
import { IFoodItem } from "../../domain/interfaces/foodItem.interface.js";
import { FoodItemDoc, FoodItemModel } from "../db/mongoose/schemas/foodItem.schema.js";
import { extractQueryOptions } from "../db/helper/utils.helper.js";
import { IOrderFoodItem } from "../../domain/interfaces/order.interface.js";

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
    // Extract query options from filter (pagination, sorting)
    const { sortBy, order, page, limit, search, ...pureFilter } = filter;

    // Build MongoDB filter object
    if (search) {
      pureFilter.name = { $regex: `^${search}`, $options: "i" };
    }
    const queryOptions = extractQueryOptions({ sortBy, order, page, limit });
    // Extract pagination/sorting options

    return await FoodItemModel.find(pureFilter, { _id: 0, __v: 0 })
      .sort(queryOptions.sort)
      .skip(queryOptions.skip || 0)
      .limit(queryOptions.limit || 10)
      .lean();
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

  async getFoodItemsForOrder(
    foodItemIds: string[]
  ): Promise<Omit<IOrderFoodItem, "quantity" | "additionals">[]> {
    const items = await FoodItemModel.find(
      { foodItemId: { $in: foodItemIds } },
      { foodItemId: 1, name: 1, price: 1, additionals: 1 } // project only what you need
    ).lean();

    return items.map(item => ({
      foodItemId: item.foodItemId as string,
      name: item.name,
      price: item.price,
    }));
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
