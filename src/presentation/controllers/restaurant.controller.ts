import { Request, Response } from "express";
import { validate } from "../../utils/validation.js";
import {
    updateRestaurantSchema,
    restaurantIdSchema,
    restaurantIdArraySchema,
} from "../validators/restaurant.validator.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { sendError } from "../../utils/sendError.js";
import { HTTP } from "../../utils/constants.js";
import { tryCatch } from "../../utils/tryCatch.js";
import { RestaurantUseCase } from "../../application/use-cases/restaurant.useCase.js";
import { restaurantSchema } from "../../domain/zod/restaurant.zod.js";
import { CustomRequest, Role } from "../../domain/interfaces/utils.interface.js";

export const RestaurantController = {
    async createRestaurant(req: CustomRequest, res: Response) {
        const validation = validate(restaurantSchema, req.body, res);
        if (!validation) return;

        return tryCatch(res, async () => {
            const newRestaurant = await RestaurantUseCase.createRestaurant(req.body);
            return sendResponse(res, HTTP.CREATED, "Restaurant created successfully", newRestaurant);
        });
    },

    async getRestaurantById(req: CustomRequest, res: Response) {
        // Validate only restaurantId from params
        const parsed = validate(restaurantIdSchema, req.params, res);

        if (!parsed) return;

        const { restaurantId } = req.params;
        const role = req.role;

        return tryCatch(res, async () => {
            const restaurant = await RestaurantUseCase.getRestaurantById(restaurantId, role as Role);
            if (!restaurant) return sendError(res, HTTP.NOT_FOUND, "Restaurant not found");
            return sendResponse(res, HTTP.OK, "Restaurant fetched successfully", restaurant);
        });
    },

    async updateRestaurant(req: CustomRequest, res: Response) {
        // Validate params: only restaurantId
        const paramCheck = validate(restaurantIdSchema, req.params, res);
        if (!paramCheck) return;

        // Validate body partial restaurant schema
        const bodyCheck = validate(updateRestaurantSchema, req.body, res);
        if (!bodyCheck) return;

        const { restaurantId } = paramCheck;

        return tryCatch(res, async () => {
            const updated = await RestaurantUseCase.updateRestaurant(restaurantId, req.body);
            if (!updated) return sendError(res, HTTP.NOT_FOUND, "Restaurant not found");
            return sendResponse(res, HTTP.OK, "Restaurant updated successfully", updated);
        });
    },

    async deleteRestaurant(req: CustomRequest, res: Response) {
        const parsed = validate(restaurantIdSchema, req.params, res);
        if (!parsed) return;

        const { restaurantId } = parsed;

        return tryCatch(res, async () => {
            const deleted = await RestaurantUseCase.deleteRestaurant(restaurantId);
            if (!deleted) return sendError(res, HTTP.NOT_FOUND, "Restaurant not found");
            return sendResponse(res, HTTP.OK, "Restaurant deleted successfully", deleted);
        });
    },

    async getAllRestaurants(req: CustomRequest, res: Response) {
        const filters = req.query;
        const role = req.role;

        return tryCatch(res, async () => {
            const restaurants = await RestaurantUseCase.getAllRestaurants(role as Role, filters);
            if (!restaurants || restaurants.length == 0) return sendError(res, HTTP.NOT_FOUND, "Restaurants not found");
            return sendResponse(res, HTTP.OK, "Restaurants fetched successfully", restaurants);
        });
    },

    async getAllRestauransById(req: CustomRequest, res: Response) {
        // ✅ Validate restaurantIds from req.body
        const parsed = validate(restaurantIdArraySchema, req.body, res);
        if (!parsed) return;

        const { restaurantIds } = parsed;
        const role = req.role;

        return tryCatch(res, async () => {
            const restaurants = await RestaurantUseCase.bulkGetByRestaurantIds(restaurantIds, role as Role);

            if (!restaurants || restaurants.length === 0) {
                return sendError(res, HTTP.NOT_FOUND, "No restaurants found");
            }

            return sendResponse(res, HTTP.OK, "Restaurants fetched successfully", restaurants);
        });
    }


};
