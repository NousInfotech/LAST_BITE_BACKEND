import { Request, Response } from "express";
import { validate } from "../../utils/validation.js";
import { tryCatch } from "../../utils/tryCatch.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { sendError } from "../../utils/sendError.js";
import { HTTP } from "../../utils/constants.js";
import { FoodItemUseCase } from "../../application/use-cases/foodItem.useCase.js";
import {
    foodItemSchema,
    updateFoodItemSchema,
    foodItemIdParamsSchema,
} from "../validators/foodItem.validator.js";
import { restaurantIdSchema } from "../validators/restaurant.validator.js";

export const FoodItemController = {
    async createFoodItem(req: Request, res: Response) {
        const validated = validate(foodItemSchema, req.body, res);
        if (!validated) return;

        return tryCatch(res, async () => {
            const foodItem = await FoodItemUseCase.createFoodItem(validated);
            return sendResponse(res, HTTP.CREATED, "Food item created successfully", foodItem);
        });
    },

    async getFoodItemById(req: Request, res: Response) {
        const parsed = validate(foodItemIdParamsSchema, req.params, res);
        if (!parsed) return;

        const { foodItemId } = parsed;

        return tryCatch(res, async () => {
            const foodItem = await FoodItemUseCase.getFoodItemById(foodItemId);
            if (!foodItem) return sendError(res, HTTP.NOT_FOUND, "Food item not found");
            return sendResponse(res, HTTP.OK, "Food item fetched successfully", foodItem);
        });
    },

    async updateFoodItem(req: Request, res: Response) {
        const paramCheck = validate(foodItemIdParamsSchema, req.params, res);
        if (!paramCheck) return;

        const bodyCheck = validate(updateFoodItemSchema, req.body, res);
        if (!bodyCheck) return;

        const { foodItemId } = paramCheck;

        return tryCatch(res, async () => {
            const updated = await FoodItemUseCase.updateFoodItem(foodItemId, bodyCheck);
            if (!updated) return sendError(res, HTTP.NOT_FOUND, "Food item not found");
            return sendResponse(res, HTTP.OK, "Food item updated successfully", updated);
        });
    },

    async deleteFoodItem(req: Request, res: Response) {
        const parsed = validate(foodItemIdParamsSchema, req.params, res);
        if (!parsed) return;

        const { foodItemId } = parsed;

        return tryCatch(res, async () => {
            const deleted = await FoodItemUseCase.deleteFoodItem(foodItemId);
            if (!deleted) return sendError(res, HTTP.NOT_FOUND, "Food item not found");
            return sendResponse(res, HTTP.OK, "Food item deleted successfully", deleted);
        });
    },

    async getAllFoodItems(req: Request, res: Response) {
        return tryCatch(res, async () => {
            const foodItems = await FoodItemUseCase.getAllFoodItems();
            return sendResponse(res, HTTP.OK, "Food items fetched successfully", foodItems);
        });
    },

    async getFoodItemByRestaurantId(req: Request, res: Response) {

        const parsed = validate(restaurantIdSchema, req.params, res);

        if (!parsed) return;

        const { restaurantId } = req.params;
        
        return tryCatch(res, async () => {
            const foodItems = await FoodItemUseCase.getByRestaurantId(restaurantId);
            return sendResponse(res, HTTP.OK, "Food items fetched successfully", foodItems);
        });
    },
};
