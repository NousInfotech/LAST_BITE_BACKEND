import { Request, Response } from "express";
import { sendResponse } from "../../utils/sendResponse.js";
import { sendError } from "../../utils/sendError.js";
import { tryCatch } from "../../utils/tryCatch.js";
import { HTTP } from "../../utils/constants.js";
import { SuperAdminUseCase } from "../../application/use-cases/superAdmin.useCase.js";
import { superAdminLoginSchema, superAdminSchema } from "../../domain/zod/superAdmin.zod.js";
import { validate } from "../../utils/validation.js";

export const SuperAdminController = {
    /** Create a new Super Admin */
    async createSuperAdmin(req: Request, res: Response) {
        const validation = validate(superAdminSchema, req.body, res);
        if (!validation) return;

        return tryCatch(res, async () => {
            const result = await SuperAdminUseCase.createSuperAdmin(validation);
            return sendResponse(res, HTTP.CREATED, "Super admin created successfully", result);
        });
    },

    /** Get Super Admin by ID */
    async getSuperAdminById(req: Request, res: Response) {
        const { superAdminId } = req.params;

        return tryCatch(res, async () => {
            const result = await SuperAdminUseCase.getSuperAdminById(superAdminId);
            if (!result) return sendError(res, HTTP.NOT_FOUND, "Super admin not found");
            return sendResponse(res, HTTP.OK, "Super admin fetched", result);
        });
    },

    /** Get Super Admin by Email */
    async getSuperAdminByEmail(req: Request, res: Response) {
        const { email } = req.params;

        return tryCatch(res, async () => {
            const result = await SuperAdminUseCase.getSuperAdminByEmail(email);
            if (!result) return sendError(res, HTTP.NOT_FOUND, "Super admin not found");
            return sendResponse(res, HTTP.OK, "Super admin fetched by email", result);
        });
    },

    /** Update Super Admin */
    async updateSuperAdmin(req: Request, res: Response) {
        const { superAdminId } = req.params;

        return tryCatch(res, async () => {
            const result = await SuperAdminUseCase.updateSuperAdmin(superAdminId, req.body);
            if (!result) return sendError(res, HTTP.NOT_FOUND, "Super admin not found or not updated");
            return sendResponse(res, HTTP.OK, "Super admin updated successfully", result);
        });
    },

    /** Delete Super Admin */
    async removeSuperAdmin(req: Request, res: Response) {
        const { superAdminId } = req.params;

        return tryCatch(res, async () => {
            const result = await SuperAdminUseCase.deleteSuperAdmin(superAdminId);
            if (!result) return sendError(res, HTTP.NOT_FOUND, "Super admin not found");
            return sendResponse(res, HTTP.OK, "Super admin deleted successfully");
        });
    },

    /** Get All Super Admins (optional filter support) */
    async getAllSuperAdmins(req: Request, res: Response) {
        return tryCatch(res, async () => {
            const result = await SuperAdminUseCase.getAllSuperAdmins(req.query);
            return sendResponse(res, HTTP.OK, "All super admins fetched", result);
        });
    },
};
