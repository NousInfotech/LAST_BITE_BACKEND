import jwt from "jsonwebtoken";
import { config } from "./env.js";
import { Role } from "../domain/interfaces/utils.interface.js";

const JWT_SECRET = config.jwtSecret;
const JWT_EXPIRES_IN = "30d";

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables.");
}

export interface JWTPayload {
    role: Role;
    roleBasedId: string;
}

/**
 * 🔐 Generate JWT token with role-based payload
 */
export const generateToken = (payload: JWTPayload): string => {
    return jwt.sign(payload, JWT_SECRET as jwt.Secret, {
        expiresIn: JWT_EXPIRES_IN,
    });
};

/**
 * 🔓 Decode & verify JWT
 */
export const verifyToken = (token: string): JWTPayload => {
    return jwt.verify(token, JWT_SECRET as jwt.Secret) as JWTPayload;
};
