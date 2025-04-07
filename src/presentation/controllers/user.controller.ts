import { Request, Response } from "express";
import { UserRepository } from "../../infrastructure/repositories/user.repository.js";
import { validate } from "../../utils/validation.js";
import {
    addressSchema,
    createUserSchema,
    userIdParamsSchema,
    firebaseIdParamsSchema,
    updateAddressSchema,
    updateUserSchema,
} from "../validators/user.validator.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { sendError } from "../../utils/sendError.js";
import { HTTP } from "../../utils/constants.js";

const userRepo = new UserRepository();

const tryCatch = async (res: Response, callback: () => Promise<any>) => {
    try {
        await callback();
    } catch (err) {
        console.error(err);
        sendError(res, HTTP.SERVER_ERROR, "Internal server error", err);
    }
};

export const UserController = {
    async createUser(req: Request, res: Response) {
        const validation = validate(createUserSchema, req.body, res);
        if (!validation) return;

        return tryCatch(res, async () => {
            const newUser = await userRepo.create(req.body);
            return sendResponse(res, HTTP.CREATED, "User created successfully", newUser);
        });
    },

    async getUserByUserId(req: Request, res: Response) {
        const parsed = validate(userIdParamsSchema, req.params, res);
        if (!parsed) return;

        const { userId } = parsed;

        return tryCatch(res, async () => {
            const user = await userRepo.findByUserId(userId);
            if (!user) return sendError(res, HTTP.NOT_FOUND, "User not found");
            return sendResponse(res, HTTP.OK, "User fetched successfully", user);
        });
    },

    async getUserByUserFireBaseId(req: Request, res: Response) {
        const parsed = validate(firebaseIdParamsSchema, req.params, res);
        if (!parsed) return;

        const { firebaseId } = parsed;

        return tryCatch(res, async () => {
            const user = await userRepo.findByFirebaseId(firebaseId);
            if (!user) return sendError(res, HTTP.NOT_FOUND, "User not found");
            return sendResponse(res, HTTP.OK, "User fetched successfully", user);
        });
    },

    async updateUser(req: Request, res: Response) {
        const paramCheck = validate(userIdParamsSchema, req.params, res);
        if (!paramCheck) return;

        const bodyCheck = validate(updateUserSchema, req.body, res);
        if (!bodyCheck) return;

        const { userId } = paramCheck;

        return tryCatch(res, async () => {
            const updatedUser = await userRepo.updateUser(userId, req.body);
            if (!updatedUser) return sendError(res, HTTP.NOT_FOUND, "User not found");
            return sendResponse(res, HTTP.OK, "User updated successfully", updatedUser);
        });
    },

    async deleteUser(req: Request, res: Response) {
        const parsed = validate(userIdParamsSchema, req.params, res);
        if (!parsed) return;

        const { userId } = parsed;

        return tryCatch(res, async () => {
            const deleted = await userRepo.deleteUser(userId);
            if (!deleted) return sendError(res, HTTP.NOT_FOUND, "User not found");
            return sendResponse(res, HTTP.OK, "User deleted successfully", deleted);
        });
    },

    async addAddress(req: Request, res: Response) {
        const paramCheck = validate(userIdParamsSchema, req.params, res);
        if (!paramCheck) return;

        const bodyCheck = validate(addressSchema, req.body, res);
        if (!bodyCheck) return;

        const { userId } = paramCheck;

        return tryCatch(res, async () => {
            const addresses = await userRepo.addAddress(userId, req.body);
            if (!addresses) return sendError(res, HTTP.NOT_FOUND, "User not found");
            return sendResponse(res, HTTP.OK, "Address added successfully", addresses);
        });
    },

    async getAddresses(req: Request, res: Response) {
        const parsed = validate(userIdParamsSchema, req.params, res);
        if (!parsed) return;

        const { userId } = parsed;

        return tryCatch(res, async () => {
            const addresses = await userRepo.getAddresses(userId);
            return sendResponse(res, HTTP.OK, "Addresses fetched successfully", addresses);
        });
    },

    async updateAddress(req: Request, res: Response) {
        const paramCheck = validate(userIdParamsSchema, req.params, res);
        if (!paramCheck) return;

        const { userId, addressId } = req.params;

        const bodyCheck = validate(updateAddressSchema, req.body, res);
        if (!bodyCheck) return;

        return tryCatch(res, async () => {
            const addresses = await userRepo.updateAddress(userId, addressId, req.body);
            if (!addresses) return sendError(res, HTTP.NOT_FOUND, "User or Address not found");
            return sendResponse(res, HTTP.OK, "Address updated successfully", addresses);
        });
    },

    async deleteAddress(req: Request, res: Response) {
        const parsed = validate(userIdParamsSchema, req.params, res);
        if (!parsed) return;

        const { userId, addressId } = req.params;

        return tryCatch(res, async () => {
            const addresses = await userRepo.deleteAddress(userId, addressId);
            if (!addresses) return sendError(res, HTTP.NOT_FOUND, "User or Address not found");
            return sendResponse(res, HTTP.OK, "Address deleted successfully", addresses);
        });
    },
};
