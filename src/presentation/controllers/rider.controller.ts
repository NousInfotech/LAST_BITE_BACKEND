import { Request, Response } from "express";
import { validate } from "../../utils/validation.js";
import { tryCatch } from "../../utils/tryCatch.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { sendError } from "../../utils/sendError.js";
import { HTTP } from "../../utils/constants.js";
import { RiderUseCase } from "../../application/use-cases/rider.useCase.js";
import { riderSchema, updateRiderSchema, riderIdParamsSchema } from "../validators/rider.validator.js";
import { generateToken } from "../../config/jwt.config.js";

export const RiderController = {
  async createRider(req: Request, res: Response) {
    const validated = validate(riderSchema, req.body, res);
    if (!validated) return;

    return tryCatch(res, async () => {
      const rider = await RiderUseCase.createRider(req.body);
      const token = generateToken({ role: "rider", roleBasedId: rider.riderId! });
      return sendResponse(res, HTTP.CREATED, "OTP verified successfully, Rider created successfully", { rider, token });
    });
  },

  async getRiderById(req: Request, res: Response) {
    const parsed = validate(riderIdParamsSchema, req.params, res);
    if (!parsed) return;

    const { riderId } = parsed;

    return tryCatch(res, async () => {
      const rider = await RiderUseCase.getRiderById(riderId);
      if (!rider) return sendError(res, HTTP.NOT_FOUND, "Rider not found");
      return sendResponse(res, HTTP.OK, "Rider fetched successfully", rider);
    });
  },

  async updateRider(req: Request, res: Response) {
    const paramCheck = validate(riderIdParamsSchema, req.params, res);
    if (!paramCheck) return;

    const bodyCheck = validate(updateRiderSchema, req.body, res);
    if (!bodyCheck) return;

    const { riderId } = paramCheck;

    return tryCatch(res, async () => {
      const updated = await RiderUseCase.updateRider(riderId, req.body);
      if (!updated) return sendError(res, HTTP.NOT_FOUND, "Rider not found");
      return sendResponse(res, HTTP.OK, "Rider updated successfully", updated);
    });
  },

  async deleteRider(req: Request, res: Response) {
    const parsed = validate(riderIdParamsSchema, req.params, res);
    if (!parsed) return;

    const { riderId } = parsed;

    return tryCatch(res, async () => {
      const deleted = await RiderUseCase.deleteRider(riderId);
      if (!deleted) return sendError(res, HTTP.NOT_FOUND, "Rider not found");
      return sendResponse(res, HTTP.OK, "Rider deleted successfully", deleted);
    });
  },
};
