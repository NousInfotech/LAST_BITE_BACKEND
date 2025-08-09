import { Request, Response } from "express";
import { validate } from "../../utils/validation.js";
import {
    updateRestaurantSchema,
    restaurantIdSchema,
    restaurantIdArraySchema,
    restaurantStatusSchema,
} from "../validators/restaurant.validator.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { sendError } from "../../utils/sendError.js";
import { HTTP } from "../../utils/constants.js";
import { tryCatch } from "../../utils/tryCatch.js";
import { RestaurantUseCase } from "../../application/use-cases/restaurant.useCase.js";
import { RestaurantAdminUseCase } from "../../application/use-cases/restaurantAdmin.useCase.js";
import { restaurantSchema } from "../../domain/zod/restaurant.zod.js";
import { CustomRequest, Role } from "../../domain/interfaces/utils.interface.js";
import { IRestaurantStatus } from "../../domain/interfaces/restaurant.interface.js";
import { z } from "zod";

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

        const role = req.role;

        return tryCatch(res, async () => {
            const restaurant = await RestaurantUseCase.getRestaurantById(parsed.restaurantId, role as Role);
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

        return tryCatch(res, async () => {
            const updated = await RestaurantUseCase.updateRestaurant(paramCheck.restaurantId, req.body);
            if (!updated) return sendError(res, HTTP.NOT_FOUND, "Restaurant not found");
            return sendResponse(res, HTTP.OK, "Restaurant updated successfully", updated);
        });
    },

    async updateRestaurantStatus(req: CustomRequest, res: Response) {
        // Validate params: only restaurantId
        const paramCheck = validate(restaurantIdSchema, req.params, res);
        if (!paramCheck) return;

        return tryCatch(res, async () => {
            // Check if the request body has a boolean status (new format) or enum status (old format)
            if (typeof req.body.status === 'boolean') {
                // New format: { status: boolean } - update isActive directly
                const updated = await RestaurantUseCase.updateRestaurant(paramCheck.restaurantId, { isActive: req.body.status });
                if (!updated) return sendError(res, HTTP.NOT_FOUND, "Restaurant not found");
                return sendResponse(res, HTTP.OK, "Restaurant active status updated successfully", updated);
            } else {
                // Old format: { status: RestaurantStatusEnum } - update restaurantStatus
                const bodyCheck = validate(restaurantStatusSchema, req.body, res) as IRestaurantStatus;
                if (!bodyCheck) return;
                
                const updated = await RestaurantUseCase.updateRestaurantStatus(paramCheck.restaurantId, bodyCheck);
                if (!updated) return sendError(res, HTTP.NOT_FOUND, "Restaurant not found");
                return sendResponse(res, HTTP.OK, "Restaurant Status updated successfully", updated);
            }
        });
    },

    async toggleRestaurantActive(req: CustomRequest, res: Response) {
        // Validate params: only restaurantId
        const paramCheck = validate(restaurantIdSchema, req.params, res);
        if (!paramCheck) return;

        // Validate body for isActive toggle
        const toggleStatusSchema = z.object({ status: z.boolean() });
        const bodyCheck = validate(toggleStatusSchema, req.body, res);
        if (!bodyCheck) return;

        return tryCatch(res, async () => {
            const updated = await RestaurantUseCase.updateRestaurant(paramCheck.restaurantId, { isActive: bodyCheck.status });
            if (!updated) return sendError(res, HTTP.NOT_FOUND, "Restaurant not found");
            return sendResponse(res, HTTP.OK, "Restaurant active status toggled successfully", updated);
        });
    },

    async deleteRestaurant(req: CustomRequest, res: Response) {
        const parsed = validate(restaurantIdSchema, req.params, res);
        if (!parsed) return;

        return tryCatch(res, async () => {
            const deleted = await RestaurantUseCase.deleteRestaurant(parsed.restaurantId);
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

        const role = req.role;

        return tryCatch(res, async () => {
            const restaurants = await RestaurantUseCase.bulkGetByRestaurantIds(parsed.restaurantIds, role as Role);

            if (!restaurants || restaurants.length === 0) {
                return sendError(res, HTTP.NOT_FOUND, "No restaurants found");
            }

            return sendResponse(res, HTTP.OK, "Restaurants fetched successfully", restaurants);
        });
    },

    async searchRestaurantsAndDishes(req: CustomRequest, res: Response) {
        const { search, rating, limit = 10, page = 1 } = req.query;
        const role = req.role;

        return tryCatch(res, async () => {
            const searchResults = await RestaurantUseCase.searchRestaurantsAndDishes({
                search: search as string,
                rating: rating ? parseFloat(rating as string) : undefined,
                limit: parseInt(limit as string),
                page: parseInt(page as string)
            }, role as Role);

            if (!searchResults) {
                return sendError(res, HTTP.NOT_FOUND, "No search results found");
            }

            return sendResponse(res, HTTP.OK, "Search results fetched successfully", searchResults);
        });
    }


};
