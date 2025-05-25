import { Request, Response } from "express";
import { validate } from "../../utils/validation.js";
import bcrypt from "bcryptjs";
import { sendResponse } from "../../utils/sendResponse.js";
import { sendError } from "../../utils/sendError.js";
import { HTTP } from "../../utils/constants.js";
import { tryCatch } from "../../utils/tryCatch.js";
import { sendOtp, verifyOtp } from "../../application/services/twilio.service.js";
import { otpSchema, phoneAndRoleSchema, phoneNumberSchema } from "../validators/auth.validator.js"; // Assuming you have a schema for validation
import { generateToken } from "../../config/jwt.config.js";
import getRoleBasedIdByPhone from "../../utils/roleIdByPhoneNumber.js";
import { superAdminLoginSchema } from "../../domain/zod/superAdmin.zod.js";
import { SuperAdminModel } from "../../infrastructure/db/mongoose/schemas/superAdmin.schema.js";


export const AuthController = {
    async sendOtp(req: Request, res: Response) {
        // Validate the body: phoneNumber, role, isNewUser
        const validation = validate(phoneAndRoleSchema, req.body, res);
        if (!validation) return;

        const { phoneNumber, role, isNewUser } = validation;

        return tryCatch(res, async () => {
            // If it's a login attempt (not new user), check if user exists
            if (!isNewUser) {
                const loginData = await getRoleBasedIdByPhone(phoneNumber, role);
                if (!loginData) {
                    return sendError(res, HTTP.NOT_FOUND, `No ${role} found with this phone number`);
                }
            }

            const otpSent = await sendOtp(phoneNumber);
            if (!otpSent) {
                return sendError(res, HTTP.BAD_REQUEST, "OTP could not be sent");
            }

            return sendResponse(res, HTTP.OK, "OTP sent successfully");
        });
    },


    async verifyOtp(req: Request, res: Response) {
        const validation = validate(otpSchema, req.body, res);
        if (!validation) return;

        const { phoneNumber, otp, role } = validation;

        return tryCatch(res, async () => {
            const isVerified = await verifyOtp(phoneNumber, otp);
            if (!isVerified) {
                return sendError(res, HTTP.UNAUTHORIZED, "Invalid OTP");
            }

            const loginData = await getRoleBasedIdByPhone(phoneNumber, role);
            if (!loginData) {
                return sendError(res, HTTP.NOT_FOUND, `No ${role} found with this phone number`);
            }

            const token = generateToken({ role, roleBasedId: loginData.roleBasedId! });

            return sendResponse(res, HTTP.OK, "OTP verified successfully", { token });
        });
    },

    async checkLogin(req: Request, res: Response) {

        const validation = validate(phoneAndRoleSchema, req.body, res);
        if (!validation) return;

        const { phoneNumber, role } = req.body;

        return tryCatch(res, async () => {
            const loginData = await getRoleBasedIdByPhone(phoneNumber, role);
            if (!loginData) {
                return sendError(res, HTTP.NOT_FOUND, `No ${role} found with this phone number`);
            }

            return sendResponse(res, HTTP.OK, "Login verified", {
                role,
                phoneNumber,
                [`${role}Id`]: loginData.roleBasedId,
            });
        });
    },

    async superAdminLogin(req: Request, res: Response) {
        const validation = validate(superAdminLoginSchema, req.body, res);
        if (!validation) return;

        const { email, password } = validation;

        return tryCatch(res, async () => {
            const superAdmin = await SuperAdminModel.findOne({ email });
            if (!superAdmin) {
                return sendError(res, HTTP.UNAUTHORIZED, "Invalid credentials");
            }

            const isPasswordCorrect = await bcrypt.compare(password, superAdmin.password);
            if (!isPasswordCorrect) {
                return sendError(res, HTTP.UNAUTHORIZED, "Invalid credentials");
            }

            const token = generateToken({
                role: "superAdmin",
                roleBasedId: superAdmin.superAdminId!,
            });

            return sendResponse(res, HTTP.OK, "Login successful", {
                token,
                role: "superAdmin",
                superAdminId: superAdmin.superAdminId,
            });
        });
    }
};
