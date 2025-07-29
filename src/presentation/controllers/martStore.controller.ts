import { Response } from "express";
import { validate } from "../../utils/validation.js";
import {
    updateMartStoreSchema,
    martStoreIdSchema,
    martStoreIdArraySchema,
    martStoreStatusSchema,
} from "../validators/martStore.validator.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { sendError } from "../../utils/sendError.js";
import { HTTP } from "../../utils/constants.js";
import { tryCatch } from "../../utils/tryCatch.js";
import { MartStoreUseCase } from "../../application/use-cases/martStore.useCase.js";
import { CustomRequest, Role } from "../../domain/interfaces/utils.interface.js";
import { IMartStoreStatus } from "../../domain/interfaces/martStore.interface.js";
import { MartStoreSchema } from "../../domain/zod/martStore.zod.js";

export const MartStoreController = {
    async createMartStore(req: CustomRequest, res: Response) {
        const validation = validate(MartStoreSchema, req.body, res);
        if (!validation) return;

        return tryCatch(res, async () => {
            const newStore = await MartStoreUseCase.createMartStore(req.body);
            return sendResponse(res, HTTP.CREATED, "Mart store created successfully", newStore);
        });
    },

    async getMartStoreById(req: CustomRequest, res: Response) {
        const parsed = validate(martStoreIdSchema, req.params, res);
        if (!parsed) return;

        const { martStoreId } = parsed;
        const role = req.role;

        return tryCatch(res, async () => {
            const store = await MartStoreUseCase.getMartStoreById(martStoreId, role as Role);
            if (!store) return sendError(res, HTTP.NOT_FOUND, "Mart store not found");
            return sendResponse(res, HTTP.OK, "Mart store fetched successfully", store);
        });
    },

    async updateMartStore(req: CustomRequest, res: Response) {
        const paramCheck = validate(martStoreIdSchema, req.params, res);
        if (!paramCheck) return;

        const bodyCheck = validate(updateMartStoreSchema, req.body, res);
        if (!bodyCheck) return;

        const { martStoreId } = paramCheck;

        return tryCatch(res, async () => {
            const updated = await MartStoreUseCase.updateMartStore(martStoreId, req.body);
            if (!updated) return sendError(res, HTTP.NOT_FOUND, "Mart store not found");
            return sendResponse(res, HTTP.OK, "Mart store updated successfully", updated);
        });
    },

    async updateMartStoreStatus(req: CustomRequest, res: Response) {
        const paramCheck = validate(martStoreIdSchema, req.params, res);
        if (!paramCheck) return;

        const bodyCheck = validate(martStoreStatusSchema, req.body, res) as IMartStoreStatus;
        if (!bodyCheck) return;

        const { martStoreId } = paramCheck;

        return tryCatch(res, async () => {
            const updated = await MartStoreUseCase.updateMartStoreStatus(martStoreId, bodyCheck);
            if (!updated) return sendError(res, HTTP.NOT_FOUND, "Mart store not found");
            return sendResponse(res, HTTP.OK, "Mart store status updated successfully", updated);
        });
    },

    async deleteMartStore(req: CustomRequest, res: Response) {
        const parsed = validate(martStoreIdSchema, req.params, res);
        if (!parsed) return;

        const { martStoreId } = parsed;

        return tryCatch(res, async () => {
            const deleted = await MartStoreUseCase.deleteMartStore(martStoreId);
            if (!deleted) return sendError(res, HTTP.NOT_FOUND, "Mart store not found");
            return sendResponse(res, HTTP.OK, "Mart store deleted successfully", deleted);
        });
    },

    async getAllMartStores(req: CustomRequest, res: Response) {
        const filters = req.query;
        const role = req.role;

        return tryCatch(res, async () => {
            const stores = await MartStoreUseCase.getAllMartStores(role as Role, filters);
            if (!stores || stores.length === 0) return sendError(res, HTTP.NOT_FOUND, "Mart stores not found");
            return sendResponse(res, HTTP.OK, "Mart stores fetched successfully", stores);
        });
    },

    async getAllMartStoresById(req: CustomRequest, res: Response) {
        const parsed = validate(martStoreIdArraySchema, req.body, res);
        if (!parsed) return;

        const { martStoreIds } = parsed;
        const role = req.role;

        return tryCatch(res, async () => {
            const stores = await MartStoreUseCase.bulkGetByCustomIds(martStoreIds, role as Role);
            if (!stores || stores.length === 0) return sendError(res, HTTP.NOT_FOUND, "No mart stores found");
            return sendResponse(res, HTTP.OK, "Mart stores fetched successfully", stores);
        });
    },
};
