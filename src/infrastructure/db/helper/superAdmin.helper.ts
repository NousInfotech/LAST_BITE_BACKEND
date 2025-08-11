import { ISuperAdmin } from "../../../domain/interfaces/superAdmin.interface.js";

export function sanitizeSuperAdmin(admin: ISuperAdmin | any) {
    if (!admin) return null;

    // If this is a Mongoose document, convert to plain object
    const adminObj = admin.toObject ? admin.toObject() : admin;

    const { password, ...rest } = adminObj;
    return rest;
}

export function sanitizeSuperAdminArray(admins: (ISuperAdmin | any)[]) {
    if (!admins) return [];
    return admins.map(sanitizeSuperAdmin);
}