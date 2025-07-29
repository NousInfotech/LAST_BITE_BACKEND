import { IMartStoreAdmin } from "../../domain/interfaces/martStoreAdmin.interface.js";
import { MartStoreAdminRepository } from "../../infrastructure/repositories/martStoreAdmin.repository.js";

const adminRepo = new MartStoreAdminRepository();

export const MartStoreAdminUseCase = {
    createAdmin: (data: IMartStoreAdmin) => adminRepo.create(data),
    getAdminById: (adminId: string) => adminRepo.findByMartStoreAdminId(adminId),
    getAdminByPhoneNumber: (phoneNumber: string) => adminRepo.findByMartStoreAdminPhoneNumber(phoneNumber),
    updateAdmin: (adminId: string, data: Partial<IMartStoreAdmin>) => adminRepo.updateAdmin(adminId, data),
    deleteAdmin: (adminId: string) => adminRepo.deleteAdmin(adminId),

    getAllAdmins: (filter?: Partial<IMartStoreAdmin>) => adminRepo.getAllAdmins(filter),
    bulkCreateAdmins: (admins: IMartStoreAdmin[]) => adminRepo.bulkCreate(admins),
    bulkGetAdminsByIds: (adminIds: string[]) => adminRepo.bulkGetByAdminIds(adminIds),
};
