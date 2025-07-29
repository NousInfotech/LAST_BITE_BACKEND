import { Request, Response } from "express";
import { validate } from "../../utils/validation.js";
import { tryCatch } from "../../utils/tryCatch.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { sendError } from "../../utils/sendError.js";
import { HTTP } from "../../utils/constants.js";
import { MartProductUseCase } from "../../application/use-cases/martProduct.useCase.js";
import {
    martProductSchema,
    updateMartProductSchema,
    martProductIdParamsSchema,
    martProductIdArraySchema,
} from "../validators/martProduct.validator.js";

import { martStoreIdSchema } from "../validators/martStore.validator.js";


export const MartProductController = {
    async createMartProduct(req: Request, res: Response) {
        const validated = validate(martProductSchema, req.body, res);
        if (!validated) return;

        return tryCatch(res, async () => {
            const product = await MartProductUseCase.createMartProduct(validated);
            return sendResponse(res, HTTP.CREATED, "Product created successfully", product);
        });
    },

    async getMartProductById(req: Request, res: Response) {
        const parsed = validate(martProductIdParamsSchema, req.params, res);
        if (!parsed) return;

        const { martProductId } = parsed;

        return tryCatch(res, async () => {
            const product = await MartProductUseCase.getMartProductById(martProductId);
            if (!product) return sendError(res, HTTP.NOT_FOUND, "Product not found");
            return sendResponse(res, HTTP.OK, "Product fetched successfully", product);
        });
    },

    async updateMartProduct(req: Request, res: Response) {
        const paramCheck = validate(martProductIdParamsSchema, req.params, res);
        if (!paramCheck) return;

        const bodyCheck = validate(updateMartProductSchema, req.body, res);
        if (!bodyCheck) return;

        const { martProductId } = paramCheck;

        return tryCatch(res, async () => {
            const updated = await MartProductUseCase.updateMartProduct(martProductId, bodyCheck);
            if (!updated) return sendError(res, HTTP.NOT_FOUND, "Product not found");
            return sendResponse(res, HTTP.OK, "Product updated successfully", updated);
        });
    },

    async deleteMartProduct(req: Request, res: Response) {
        const parsed = validate(martProductIdParamsSchema, req.params, res);
        if (!parsed) return;

        const { martProductId } = parsed;

        return tryCatch(res, async () => {
            const deleted = await MartProductUseCase.deleteMartProduct(martProductId);
            if (!deleted) return sendError(res, HTTP.NOT_FOUND, "Product not found");
            return sendResponse(res, HTTP.OK, "Product deleted successfully", deleted);
        });
    },

    async getAllMartProducts(req: Request, res: Response) {
        const filters = req.query;
        return tryCatch(res, async () => {
            const products = await MartProductUseCase.getAllMartProducts(filters);
            if (!products || products.length === 0) {
                return sendError(res, HTTP.NOT_FOUND, "No products found");
            }
            return sendResponse(res, HTTP.OK, "Products fetched successfully", products);
        });
    },

    async getMartProductsByIds(req: Request, res: Response) {
        const parsed = validate(martProductIdArraySchema, req.body, res);
        if (!parsed) return;

        const { martProductIds } = parsed;

        return tryCatch(res, async () => {
            const products = await MartProductUseCase.bulkGetByProductIds(martProductIds);
            if (!products || products.length === 0) {
                return sendError(res, HTTP.NOT_FOUND, "No products found");
            }
            return sendResponse(res, HTTP.OK, "Products fetched successfully", products);
        });
    },

    async getMartProductsByStoreId(req: Request, res: Response) {
        const parsed = validate(martStoreIdSchema, req.params, res);
        if (!parsed) return;

        const { martStoreId } = parsed;

        return tryCatch(res, async () => {
            const products = await MartProductUseCase.getByMartStoreId(martStoreId);
            return sendResponse(res, HTTP.OK, "Products fetched successfully", products);
        });
    },
};
