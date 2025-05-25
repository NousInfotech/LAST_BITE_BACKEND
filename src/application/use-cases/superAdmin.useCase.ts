import { ISuperAdmin } from "../../domain/interfaces/superAdmin.interface.js";
import { SuperAdminRepository } from "../../infrastructure/repositories/superAdmin.repository.js";
import { sanitizeSuperAdmin, sanitizeSuperAdminArray } from "../../infrastructure/db/helper/superAdmin.helper.js";

const superAdminRepo = new SuperAdminRepository();

export const SuperAdminUseCase = {
    createSuperAdmin: async (data: ISuperAdmin) => {
        const created = await superAdminRepo.create(data) as ISuperAdmin;
        return sanitizeSuperAdmin(created);
    },
    getSuperAdminById: async (superAdminId: string) => {
        const admin = await superAdminRepo.findBySuperAdminId(superAdminId) as ISuperAdmin;
        return sanitizeSuperAdmin(admin);
    },
    getSuperAdminByEmail: async (email: string) => {
        const admin = await superAdminRepo.findByEmail(email) as ISuperAdmin;
        return sanitizeSuperAdmin(admin);
    },
    updateSuperAdmin: async (superAdminId: string, data: Partial<ISuperAdmin>) => {
        const updated = await superAdminRepo.update(superAdminId, data) as ISuperAdmin;
        return sanitizeSuperAdmin(updated);
    },
    deleteSuperAdmin: (superAdminId: string) => superAdminRepo.delete(superAdminId),
    getAllSuperAdmins: async (filter?: Partial<ISuperAdmin>) => {
        const admins = await superAdminRepo.getAll(filter) as ISuperAdmin[];
        return sanitizeSuperAdminArray(admins);
    },
};
