import { Request, Response } from "express";
import { validate } from "../../utils/validation.js";
import {
    addressSchema,
    userIdSchema,
    updateAddressSchema,
    updateUserSchema,
    favoriteValidator,
    blockedRestaurantsValidator,
} from "../validators/user.validator.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { sendError } from "../../utils/sendError.js";
import { HTTP } from "../../utils/constants.js";
import { tryCatch } from "../../utils/tryCatch.js";
import { UserUseCase } from "../../application/use-cases/user.useCase.js";
import { userSchema } from "../../domain/zod/user.zod.js";
import { CustomRequest } from "../../domain/interfaces/utils.interface.js";
import { generateToken } from "../../config/jwt.config.js";


export const UserController = {
    async createUser(req: CustomRequest, res: Response) {
        const validation = validate(userSchema, req.body, res);
        if (!validation) return;

        return tryCatch(res, async () => {
            const newUser = await UserUseCase.createUser(req.body);
            const token = generateToken({ role: "user", roleBasedId: newUser.userId! });
            return sendResponse(res, HTTP.CREATED, "User Created Successfully OTP verified successfully", { newUser, token });
        });
    },

    async getUserByUserId(req: CustomRequest, res: Response) {
        const parsed = validate(userIdSchema, req, res);
        if (!parsed) return;

        const { userId } = parsed;

        return tryCatch(res, async () => {
            const user = await UserUseCase.getUserByUserId(userId);
            if (!user) return sendError(res, HTTP.NOT_FOUND, "User not found");
            return sendResponse(res, HTTP.OK, "User fetched successfully", user);
        });
    },

    async updateUser(req: CustomRequest, res: Response) {
        const paramCheck = validate(userIdSchema, req, res);
        if (!paramCheck) return;

        const bodyCheck = validate(updateUserSchema, req.body, res);
        if (!bodyCheck) return;

        const { userId } = paramCheck;

        return tryCatch(res, async () => {
            const updatedUser = await UserUseCase.updateUser(userId, req.body);
            if (!updatedUser) return sendError(res, HTTP.NOT_FOUND, "User not found");
            return sendResponse(res, HTTP.OK, "User updated successfully", updatedUser);
        });
    },

    async deleteUser(req: CustomRequest, res: Response) {
        const parsed = validate(userIdSchema, req, res);
        if (!parsed) return;

        const { userId } = parsed;

        return tryCatch(res, async () => {
            const deleted = await UserUseCase.deleteUser(userId);
            if (!deleted) return sendError(res, HTTP.NOT_FOUND, "User not found");
            return sendResponse(res, HTTP.OK, "User deleted successfully", deleted);
        });
    },

    async addAddress(req: CustomRequest, res: Response) {
        const paramCheck = validate(userIdSchema, req, res);
        if (!paramCheck) return;

        const bodyCheck = validate(addressSchema, req.body, res);
        if (!bodyCheck) return;

        const { userId } = paramCheck;

        return tryCatch(res, async () => {
            const addresses = await UserUseCase.addAddress(userId, req.body);
            if (!addresses) return sendError(res, HTTP.NOT_FOUND, "User not found");
            return sendResponse(res, HTTP.OK, "Address added successfully", addresses);
        });
    },

    async getAddresses(req: CustomRequest, res: Response) {
        const parsed = validate(userIdSchema, req, res);
        if (!parsed) return;

        const { userId } = parsed;

        return tryCatch(res, async () => {
            const addresses = await UserUseCase.getAddresses(userId);
            return sendResponse(res, HTTP.OK, "Addresses fetched successfully", addresses);
        });
    },

    async updateAddress(req: CustomRequest, res: Response) {
        const paramCheck = validate(userIdSchema, req, res);
        if (!paramCheck) return;

        const { userId, addressId } = req.params;

        const bodyCheck = validate(updateAddressSchema, req.body, res);
        if (!bodyCheck) return;

        return tryCatch(res, async () => {
            const addresses = await UserUseCase.updateAddress(userId, addressId, req.body);
            if (!addresses) return sendError(res, HTTP.NOT_FOUND, "User or Address not found");
            return sendResponse(res, HTTP.OK, "Address updated successfully", addresses);
        });
    },



    async deleteAddress(req: CustomRequest, res: Response) {
        const parsed = validate(userIdSchema, req, res);
        if (!parsed) return;

        const { userId, addressId } = req.params;

        return tryCatch(res, async () => {
            const addresses = await UserUseCase.deleteAddress(userId, addressId);
            if (!addresses) return sendError(res, HTTP.NOT_FOUND, "User or Address not found");
            return sendResponse(res, HTTP.OK, "Address deleted successfully", addresses);
        });
    },

    async updateUserFavourites(req: CustomRequest, res: Response) {
        const parsed = validate(userIdSchema, req, res); // ✅ fixed here
        if (!parsed) return;

        const { userId } = parsed;

        const bodyCheck = validate(favoriteValidator, req.body, res);
        if (!bodyCheck) return;

        const { action, favourites } = bodyCheck;

        return tryCatch(res, async () => {
            const favouritesCollection = await UserUseCase.updateFavourites(userId, favourites, action);
            if (!favouritesCollection) {
                return sendError(res, HTTP.NOT_FOUND, "User not found or favourites update failed");
            }
            return sendResponse(res, HTTP.OK, "Favourites updated successfully", favourites);
        });
    },
    async updateUserBlcokedRestaurants(req: CustomRequest, res: Response) {
        const parsed = validate(userIdSchema, req, res); // ✅ fixed here
        if (!parsed) return;

        const { userId } = parsed;

        const bodyCheck = validate(blockedRestaurantsValidator, req.body, res);
        if (!bodyCheck) return;

        const { action, restaurants } = bodyCheck;

        return tryCatch(res, async () => {
            const favouritesCollection = await UserUseCase.updateBlockedRestaurans(userId, restaurants, action);
            if (!favouritesCollection) {
                return sendError(res, HTTP.NOT_FOUND, "User not found or blocked update failed");
            }
            return sendResponse(res, HTTP.OK, "Blocked updated successfully", restaurants);
        });
    }

};
