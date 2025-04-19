import { IRestaurantAdmin } from "../../domain/interfaces/restaurantAdmin.interface.js";
import { RestaurantAdminRepository } from "../../infrastructure/repositories/restaurantAdmin.repository.js";

const adminRepo = new RestaurantAdminRepository();

export const RestaurantAdminUseCase = {
    createAdmin: (data: IRestaurantAdmin) => adminRepo.create(data),
    getAdminById: (adminId: string) => adminRepo.findByRestaurantAdminId(adminId),
    getAdminByPhoneNumber: (phoneNumber: string) => adminRepo.findByRestaurantAdminPhoneNumber(phoneNumber),
    updateAdmin: (adminId: string, data: Partial<IRestaurantAdmin>) => adminRepo.updateAdmin(adminId, data),
    deleteAdmin: (adminId: string) => adminRepo.deleteAdmin(adminId),

    getAllAdmins: (filter?: Partial<IRestaurantAdmin>) => adminRepo.getAllAdmins(filter),
    bulkCreateAdmins: (admins: IRestaurantAdmin[]) => adminRepo.bulkCreate(admins),
    bulkGetAdminsByIds: (adminIds: string[]) => adminRepo.bulkGetByAdminIds(adminIds),
};
