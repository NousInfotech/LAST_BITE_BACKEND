import { Request, Response } from "express";
import { validate } from "../../utils/validation.js";
import {
    addressSchema,
    userIdSchema,
    updateAddressSchema,
    updateUserSchema,
    favoriteValidator,
} from "../validators/user.validator.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { sendError } from "../../utils/sendError.js";
import { HTTP } from "../../utils/constants.js";
import { tryCatch } from "../../utils/tryCatch.js";
import { UserUseCase } from "../../application/use-cases/user.useCase.js";
import { userSchema } from "../../domain/zod/user.zod.js";
import { CustomRequest } from "../../domain/interfaces/utils.interface.js";


export const UserController = {
    async createUser(req: CustomRequest, res: Response) {
        const validation = validate(userSchema, req.body, res);
        if (!validation) return;

        return tryCatch(res, async () => {
            const newUser = await UserUseCase.createUser(req.body);
            return sendResponse(res, HTTP.CREATED, "User created successfully", newUser);
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
        const parsed = validate(userIdSchema, req, res);
        if (!parsed) return;
        const bodyCheck = validate(favoriteValidator, req.body, res);
        if (!bodyCheck) return;
        const { restaurantId, action } = bodyCheck;

        return tryCatch(res, async () => {
            const favourites = await UserUseCase.updateFavourites(parsed.userId, restaurantId, action);
            if (!favourites) return sendError(res, HTTP.NOT_FOUND, "User not found or favourites update failed");
            return sendResponse(res, HTTP.OK, "Favourites updated successfully", favourites);

        });
    },
};
