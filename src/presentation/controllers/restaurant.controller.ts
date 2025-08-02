import { Request, Response } from "express";
import { validate } from "../../utils/validation.js";
import {
    updateRestaurantSchema,
    restaurantIdSchema,
    restaurantIdArraySchema,
    restaurantStatusSchema,
} from "../validators/restaurant.validator.js";
import { z } from "zod";
import { sendResponse } from "../../utils/sendResponse.js";
import { sendError } from "../../utils/sendError.js";
import { HTTP } from "../../utils/constants.js";
import { tryCatch } from "../../utils/tryCatch.js";
import { RestaurantUseCase } from "../../application/use-cases/restaurant.useCase.js";
import { RestaurantAdminUseCase } from "../../application/use-cases/restaurantAdmin.useCase.js";
import { restaurantSchema } from "../../domain/zod/restaurant.zod.js";
import { CustomRequest, Role } from "../../domain/interfaces/utils.interface.js";
import { IRestaurantStatus } from "../../domain/interfaces/restaurant.interface.js";

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

    async updateRestaurantStatus(req: CustomRequest, res: Response) {
        // Validate params: only restaurantId
        const paramCheck = validate(restaurantIdSchema, req.params, res);
        if (!paramCheck) return;

        const { restaurantId } = paramCheck;

        return tryCatch(res, async () => {
            // Check if the request body has a boolean status (new format) or enum status (old format)
            if (typeof req.body.status === 'boolean') {
                // New format: { status: boolean } - update isActive directly
                const updated = await RestaurantUseCase.updateRestaurant(restaurantId, { isActive: req.body.status });
                if (!updated) return sendError(res, HTTP.NOT_FOUND, "Restaurant not found");
                return sendResponse(res, HTTP.OK, "Restaurant active status updated successfully", updated);
            } else {
                // Old format: { status: RestaurantStatusEnum } - update restaurantStatus
                const bodyCheck = validate(restaurantStatusSchema, req.body, res) as IRestaurantStatus;
                if (!bodyCheck) return;
                
                const updated = await RestaurantUseCase.updateRestaurantStatus(restaurantId, bodyCheck);
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
        const bodyCheck = validate(z.object({ status: z.boolean() }), req.body, res) as { status: boolean };
        if (!bodyCheck) return;

        const { restaurantId } = paramCheck;
        const { status } = bodyCheck;
        const userRole = req.role;
        const userId = req.restaurantAdminId || req.superAdminId;

        return tryCatch(res, async () => {
            // For restaurant admins, verify they own this restaurant
            if (userRole === 'restaurantAdmin' && userId) {
                const adminData = await RestaurantAdminUseCase.getAdminById(userId);
                
                if (!adminData || adminData.restaurantId !== restaurantId) {
                    return sendError(res, HTTP.FORBIDDEN, "You can only toggle your own restaurant's status");
                }
            }

            const updated = await RestaurantUseCase.updateRestaurant(restaurantId, { isActive: status });
            if (!updated) return sendError(res, HTTP.NOT_FOUND, "Restaurant not found");
            return sendResponse(res, HTTP.OK, "Restaurant active status updated successfully", updated);
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
