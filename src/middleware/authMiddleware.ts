// src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import admin from "../config/firebaseConfig.js";
import { UserRepository } from "../infrastructure/repositories/user.repository.js";
import { sendError } from "../utils/sendError.js";
import { HTTP } from "../utils/constants.js";

export interface AuthenticatedRequest extends Request {
    userId?: string;
}

const userRepo = new UserRepository();

export const authMiddleware = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            sendError(res, HTTP.UNAUTHORIZED, "Unauthorized: No token provided");
            return;
        }

        const token = authHeader.split(" ")[1];
        const decodedToken = await admin.auth().verifyIdToken(token);
        const firebaseUid = decodedToken.uid;

        const user = await userRepo.findByFirebaseId(firebaseUid);

        if (!user) {
            sendError(res, HTTP.UNAUTHORIZED, "Unauthorized: User not found");
            return;
        }

        if (req.params.userId && req.params.userId !== user.userId) {
            sendError(res, HTTP.FORBIDDEN, "Forbidden: Cannot access this user's data");
            return;
        }

        req.params.userId = user.userId!;
        next();
    } catch (error) {
        console.error("Firebase token verification failed:", error);
        sendError(res, HTTP.UNAUTHORIZED, "Unauthorized: Invalid token", error);
    }
};
