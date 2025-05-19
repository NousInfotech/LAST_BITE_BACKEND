import { IFoodItem } from "../../domain/interfaces/foodItem.interface.js";
import { FoodItemRepository } from "../../infrastructure/repositories/foodItem.repository.js";
import { RestaurantRepository } from "../../infrastructure/repositories/restaurant.repository.js";

const foodItemRepo = new FoodItemRepository();
const restaurantRepo = new RestaurantRepository();

export const FoodItemUseCase = {
    // Create a food item
    createFoodItem: async (data: IFoodItem) => {
        const { restaurantId } = data;

        // Check if the restaurant exists before creating the food item
        const restaurant = await restaurantRepo.findByRestaurantId(restaurantId);
        if (!restaurant) {
            throw new Error(`Restaurant with restaurantId "${restaurantId}" does not exist.`);
        }

        // Create the food item
        return await foodItemRepo.create(data);
    },

    // Get a food item by custom foodItemId
    getFoodItemById: (foodItemId: string) => foodItemRepo.findByFoodItemId(foodItemId),

    // Update a food item
    updateFoodItem: (foodItemId: string, data: Partial<IFoodItem>) =>
        foodItemRepo.updateFoodItem(foodItemId, data),

    // Delete a food item
    deleteFoodItem: (foodItemId: string) => foodItemRepo.deleteFoodItem(foodItemId),

    // Get all food items (optional filter)
    getAllFoodItems: (filter: Partial<IFoodItem> = {}) => foodItemRepo.getAllFoodItems(filter),

    // Get all food items by restaurantId
    getByRestaurantId: (restaurantId: string) => foodItemRepo.getByRestaurantId(restaurantId),

    // Bulk create food items
    bulkCreateFoodItems: (data: IFoodItem[]) => foodItemRepo.bulkCreate(data),

    // Bulk fetch food items by array of foodItemIds
    bulkGetByFoodItemIds: (ids: string[]) => foodItemRepo.bulkGetByFoodItemIds(ids),
};
