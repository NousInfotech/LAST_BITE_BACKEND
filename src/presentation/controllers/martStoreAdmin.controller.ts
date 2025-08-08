import { Request, Response } from "express";
import { validate } from "../../utils/validation.js";
import { tryCatch } from "../../utils/tryCatch.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { sendError } from "../../utils/sendError.js";
import { HTTP } from "../../utils/constants.js";
import { MartStoreAdminUseCase } from "../../application/use-cases/martStoreAdmin.useCase.js";
import { adminSchema, updateAdminSchema, adminIdParamsSchema } from "../validators/martStoreAdmin.validator.js";
import { generateToken } from "../../config/jwt.config.js";
import { CustomRequest } from "../../domain/interfaces/utils.interface.js";

export const MartStoreAdminController = {
  async createAdmin(req: Request, res: Response) {
    const validated = validate(adminSchema, req.body, res);
    if (!validated) return;

    return tryCatch(res, async () => {
      console.log("🔍 Creating MartStoreAdmin with data:", req.body);
      const admin = await MartStoreAdminUseCase.createAdmin(req.body);
      console.log("🔍 Created MartStoreAdmin:", admin);
      console.log("🔍 Admin ID for token:", admin.martStoreAdminId);
      const token = generateToken({ role: "martStoreAdmin", roleBasedId: admin.martStoreAdminId! });
      console.log("🔍 Generated token for admin ID:", admin.martStoreAdminId);
      return sendResponse(res, HTTP.CREATED, "OTP verified successfully", { admin, token });
    });
  },

  async getAdminById(req: Request, res: Response) {
    const parsed = validate(adminIdParamsSchema, req.params, res);
    if (!parsed) return;

    const { adminId } = parsed;

    return tryCatch(res, async () => {
      const admin = await MartStoreAdminUseCase.getAdminById(adminId);
      if (!admin) return sendError(res, HTTP.NOT_FOUND, "Admin not found");
      return sendResponse(res, HTTP.OK, "Admin fetched successfully", admin);
    });
  },
  async getAllAdmins(req: Request, res: Response) {

    return tryCatch(res, async () => {
      console.log("🔍 Getting all MartStoreAdmins...");
      const admins = await MartStoreAdminUseCase.getAllAdmins();
      console.log("🔍 Found admins:", admins);
      if (!admins || admins.length === 0) return sendError(res, HTTP.NOT_FOUND, "Admins not found");
      return sendResponse(res, HTTP.OK, "Admins fetched successfully", admins);
    });
  },

  async updateAdmin(req: Request, res: Response) {
    const paramCheck = validate(adminIdParamsSchema, req.params, res);
    if (!paramCheck) return;

    const bodyCheck = validate(updateAdminSchema, req.body, res);
    if (!bodyCheck) return;

    const { adminId } = paramCheck;

    return tryCatch(res, async () => {
      const updated = await MartStoreAdminUseCase.updateAdmin(adminId, req.body);
      if (!updated) return sendError(res, HTTP.NOT_FOUND, "Admin not found");
      return sendResponse(res, HTTP.OK, "Admin updated successfully", updated);
    });
  },

  async deleteAdmin(req: Request, res: Response) {
    const parsed = validate(adminIdParamsSchema, req.params, res);
    if (!parsed) return;

    const { adminId } = parsed;

    return tryCatch(res, async () => {
      const deleted = await MartStoreAdminUseCase.deleteAdmin(adminId);
      if (!deleted) return sendError(res, HTTP.NOT_FOUND, "Admin not found");
      return sendResponse(res, HTTP.OK, "Admin deleted successfully", deleted);
    });
  },

  async getMartStoreOrders(req: CustomRequest, res: Response) {
    return tryCatch(res, async () => {
      const martStoreAdminId = req.martStoreAdminId;
      if (!martStoreAdminId) {
        return sendError(res, HTTP.UNAUTHORIZED, "Mart store admin ID not found");
      }

      console.log("🔍 Getting orders for mart store admin:", martStoreAdminId);
      
      // Get the admin data to find the associated mart store
      const admin = await MartStoreAdminUseCase.getAdminById(martStoreAdminId);
      if (!admin) {
        return sendError(res, HTTP.NOT_FOUND, "Mart store admin not found");
      }

      if (!admin.martStoreId) {
        return sendError(res, HTTP.NOT_FOUND, "No mart store associated with this admin");
      }

      console.log("🔍 Getting orders for mart store:", admin.martStoreId);
      
      // Get orders for the mart store
      const orders = await MartStoreAdminUseCase.getMartStoreOrders(admin.martStoreId);
      
      if (!orders || orders.length === 0) {
        return sendResponse(res, HTTP.OK, "No orders found for this mart store", { orders: [] });
      }

      return sendResponse(res, HTTP.OK, "Orders fetched successfully", { orders });
    });
  },
};
