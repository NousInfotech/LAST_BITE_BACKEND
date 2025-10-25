import { IMartStoreAdmin } from "../../domain/interfaces/martStoreAdmin.interface.js";
import { MartStoreAdminRepository } from "../../infrastructure/repositories/martStoreAdmin.repository.js";
import { OrderRepository } from "../../infrastructure/repositories/order.repository.js";

const adminRepo = new MartStoreAdminRepository();
const orderRepo = new OrderRepository();

export const MartStoreAdminUseCase = {
    createAdmin: (data: IMartStoreAdmin) => adminRepo.create(data),
    getAdminById: (adminId: string) => adminRepo.findByMartStoreAdminId(adminId),
    getAdminByPhoneNumber: (phoneNumber: string) => adminRepo.findByMartStoreAdminPhoneNumber(phoneNumber),
    updateAdmin: (adminId: string, data: Partial<IMartStoreAdmin>) => adminRepo.updateAdmin(adminId, data),
    deleteAdmin: (adminId: string) => adminRepo.deleteAdmin(adminId),

    getAllAdmins: (filter?: Partial<IMartStoreAdmin>) => adminRepo.getAllAdmins(filter),
    bulkCreateAdmins: (admins: IMartStoreAdmin[]) => adminRepo.bulkCreate(admins),
    bulkGetAdminsByIds: (adminIds: string[]) => adminRepo.bulkGetByAdminIds(adminIds),
    updateFCMToken: (martStoreAdminId: string, deviceName: string, fcmToken: string) => adminRepo.updateFCMToken(martStoreAdminId, { deviceName, token: fcmToken }),
    
    // Get orders for a mart store
    getMartStoreOrders: (martStoreId: string) => orderRepo.getOrdersByMartStoreId(martStoreId),
};
