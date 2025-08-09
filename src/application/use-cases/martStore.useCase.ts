import { MartStoreRepository } from "../../infrastructure/repositories/martStore.repository.js";
import { IMartStore, IMartStoreStatus } from "../../domain/interfaces/martStore.interface.js";
import { UpdateQuery, FilterQuery } from "mongoose";
import { Role } from "../../domain/interfaces/utils.interface.js";
import { sendRestaurantNotification } from "../../presentation/sockets/restaurantNotification.socket.js";

const martStoreRepo = new MartStoreRepository();

export const MartStoreUseCase = {
    /**
     * Create a new mart store
     */
    createMartStore: (data: IMartStore) => {
        return martStoreRepo.create(data);
    },

    /**
     * Get a mart store by its customId with role-based filtering
     */
    getMartStoreById: async (customId: string, role: Role) => {
        return await martStoreRepo.findByMartStoreId(customId);
    },

    /**
     * Get all mart stores with optional filters and role-based sanitization
     */
    getAllMartStores: async (role: Role, filter: FilterQuery<IMartStore> = {}) => {
        return await martStoreRepo.getAllMartStores(filter);
    },

    /**
     * Update a mart store by its customId
     */
    updateMartStore: (customId: string, updateData: UpdateQuery<IMartStore>) => {
        return martStoreRepo.updateMartStore(customId, updateData);
    },

    /**
     * Update store status by ID
     */
    updateMartStoreStatus: async (customId: string, status: IMartStoreStatus) => {
        const updated = await martStoreRepo.updateMartStoreStatus(customId, status.status, status.message, status.days);
        try {
            sendRestaurantNotification(customId, {
                type: 'system',
                targetRole: 'restaurantAdmin',
                targetRoleId: customId,
                message: `Store ${String(status.status).toLowerCase()}`,
                emoji: '🛒',
                theme: 'info',
                metadata: { message: status.message, days: status.days }
            } as any);
        } catch {}
        return updated;
    },

    /**
     * Delete a mart store
     */
    deleteMartStore: (customId: string) => {
        return martStoreRepo.deleteMartStore(customId);
    },

    /**
     * Bulk insert stores
     */
    bulkCreateMartStores: (stores: IMartStore[]) => {
        return martStoreRepo.bulkCreate(stores);
    },

    /**
     * Bulk get stores by custom IDs with role-based sanitization
     */
    bulkGetByCustomIds: async (customIds: string[], role: Role) => {
       return await martStoreRepo.bulkGetByMartStoreIds(customIds);
    },
};
