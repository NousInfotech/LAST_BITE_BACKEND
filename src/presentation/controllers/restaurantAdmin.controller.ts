import { Request, Response } from "express";
import { validate } from "../../utils/validation.js";
import { tryCatch } from "../../utils/tryCatch.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { sendError } from "../../utils/sendError.js";
import { HTTP } from "../../utils/constants.js";
import { RestaurantAdminUseCase } from "../../application/use-cases/restaurantAdmin.useCase.js";
import { adminSchema, updateAdminSchema, adminIdParamsSchema } from "../validators/restaurantAdmin.validator.js";

export const RestaurantAdminController = {
  async createAdmin(req: Request, res: Response) {
    const validated = validate(adminSchema, req.body, res);
    if (!validated) return;

    return tryCatch(res, async () => {
      const admin = await RestaurantAdminUseCase.createAdmin(req.body);
      return sendResponse(res, HTTP.CREATED, "Admin created successfully", admin);
    });
  },

  async getAdminById(req: Request, res: Response) {
    const parsed = validate(adminIdParamsSchema, req.params, res);
    if (!parsed) return;

    const { adminId } = parsed;

    return tryCatch(res, async () => {
      const admin = await RestaurantAdminUseCase.getAdminById(adminId);
      if (!admin) return sendError(res, HTTP.NOT_FOUND, "Admin not found");
      return sendResponse(res, HTTP.OK, "Admin fetched successfully", admin);
    });
  },

  async updateAdmin(req: Request, res: Response) {
    const paramCheck = validate(adminIdParamsSchema, req.params, res);
    if (!paramCheck) return;

    const bodyCheck = validate(updateAdminSchema, req.body, res);
    if (!bodyCheck) return;

    const { adminId } = paramCheck;

    return tryCatch(res, async () => {
      const updated = await RestaurantAdminUseCase.updateAdmin(adminId, req.body);
      if (!updated) return sendError(res, HTTP.NOT_FOUND, "Admin not found");
      return sendResponse(res, HTTP.OK, "Admin updated successfully", updated);
    });
  },

  async deleteAdmin(req: Request, res: Response) {
    const parsed = validate(adminIdParamsSchema, req.params, res);
    if (!parsed) return;

    const { adminId } = parsed;

    return tryCatch(res, async () => {
      const deleted = await RestaurantAdminUseCase.deleteAdmin(adminId);
      if (!deleted) return sendError(res, HTTP.NOT_FOUND, "Admin not found");
      return sendResponse(res, HTTP.OK, "Admin deleted successfully", deleted);
    });
  },
};
