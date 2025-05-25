import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/sendError.js";
import { HTTP } from "../utils/constants.js";
import { verifyToken } from "../config/jwt.config.js";

// Import all your role-based use cases
import { UserUseCase } from "../application/use-cases/user.useCase.js";
import { RiderUseCase } from "../application/use-cases/rider.useCase.js";
import { RestaurantAdminUseCase } from "../application/use-cases/restaurantAdmin.useCase.js";
import { Role } from "../domain/interfaces/utils.interface.js";
import { SuperAdminUseCase } from "../application/use-cases/superAdmin.useCase.js";

export interface AuthenticatedRequest extends Request {
    userId?: string;
    restaurantAdminId?: string;
    riderId?: string;
    superAdminId?: string;
    role?: Role;
}

/**
 * Role-based dynamic authentication middleware
 * @param allowedRoles Optional array of roles allowed for the route
 */
export const authMiddleware = (allowedRoles: string[] = []) => {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                sendError(res, HTTP.UNAUTHORIZED, "Unauthorized: No token provided");
                return
            }

            const token = authHeader.split(" ")[1];
            //  { role, roleBasedId }
            // Should return
            const decoded = verifyToken(token);

            const { role, roleBasedId } = decoded;

            if (!role || !roleBasedId) {
                sendError(res, HTTP.UNAUTHORIZED, "Unauthorized: Token missing required fields");
                return
            }

            // Optional: Role filtering
            if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
                sendError(res, HTTP.FORBIDDEN, `Forbidden: Role '${role}' not allowed`);
                return
            }

            let exists = null;

            // Role-based ID validation using appropriate use case
            switch (role) {
                case "user":
                    exists = await UserUseCase.getUserByUserId(roleBasedId);
                    if (exists) req.userId = roleBasedId;
                    break;
                case "restaurantAdmin":
                    exists = await RestaurantAdminUseCase.getAdminById(roleBasedId);
                    if (exists) req.restaurantAdminId = roleBasedId;
                    break;
                case "rider":
                    exists = await RiderUseCase.getRiderById(roleBasedId);
                    if (exists) req.riderId = roleBasedId;
                    break;
                case "superAdmin":
                    exists = await SuperAdminUseCase.getSuperAdminById(roleBasedId);
                    if (exists) req.superAdminId = roleBasedId;
                    break;
                default:
                    sendError(res, HTTP.UNAUTHORIZED, `Unauthorized: Invalid role '${role}'`);
                    return
            }

            if (!exists) {
                sendError(res, HTTP.UNAUTHORIZED, `Unauthorized: ${role} not found`);
                return
            }

            // Attach role to the request object (not params)
            req.role = role as Role;

            next();
        } catch (error) {
            console.error("JWT verification failed:", error);
            sendError(res, HTTP.UNAUTHORIZED, "Unauthorized: Invalid token", error);
            return
        }
    };
};
