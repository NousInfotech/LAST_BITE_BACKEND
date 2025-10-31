import { MartStoreRepository } from "../../infrastructure/repositories/martStore.repository.js";
import { IMartStore, IMartStoreStatus } from "../../domain/interfaces/martStore.interface.js";
import { UpdateQuery, FilterQuery } from "mongoose";
import { Role } from "../../domain/interfaces/utils.interface.js";
import { sendRestaurantNotification } from "../../presentation/sockets/restaurantNotification.socket.js";
import { sendFCMNotification } from "../services/fcm.service.js";
import { MartStoreAdminRepository } from "../../infrastructure/repositories/martStoreAdmin.repository.js";
import { RestaurantStatusEnum } from "../../domain/interfaces/utils.interface.js";
import { IFCM } from "../../domain/interfaces/notification.interface.js";

const martStoreRepo = new MartStoreRepository();
const martStoreAdminRepo = new MartStoreAdminRepository();

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
    updateMartStore: async (customId: string, updateData: UpdateQuery<IMartStore>) => {
        // Get current mart store to check if status is being changed to VERIFIED
        const currentMartStore = await martStoreRepo.findByMartStoreId(customId);
        const updated = await martStoreRepo.updateMartStore(customId, updateData);
        
        // Send FCM notification if mart store status is VERIFIED (approved)
        // Check if mart store status changed to VERIFIED
        const isApproved = updated?.storeStatus?.status === RestaurantStatusEnum.VERIFIED;
        
        if (isApproved && (!currentMartStore || currentMartStore.storeStatus?.status !== RestaurantStatusEnum.VERIFIED)) {
            try {
                const martStoreAdmin = await martStoreAdminRepo.findByMartStoreAdminByMartStoreId(customId);
                if (martStoreAdmin?.fcmTokens && martStoreAdmin.fcmTokens.length > 0) {
                    await sendFCMNotification({
                        tokens: martStoreAdmin.fcmTokens.map((token: IFCM) => token.token),
                        title: "🎉 Mart Store Approved!",
                        body: `Your mart store "${updated.martStoreName || 'Mart Store'}" has been approved and is now active on LastBite. You can now start accepting orders!`,
                        data: {
                            type: "martstore_approved",
                            martStoreId: customId,
                            status: "verified"
                        }
                    });
                    console.log(`✅ FCM notification sent for mart store approval: ${customId}`);
                }
            } catch (error) {
                console.error(`❌ Error sending FCM notification for mart store approval: ${customId}`, error);
            }
        }
        
        return updated;
    },

    /**
     * Update store status by ID
     */
    updateMartStoreStatus: async (customId: string, status: IMartStoreStatus) => {
        const isVerified = status.status === RestaurantStatusEnum.VERIFIED;
        const updated = await martStoreRepo.updateMartStoreStatus(customId, status.status, status.message, status.days);
        
        try {
            sendRestaurantNotification(customId, {
                type: 'system',
                targetRole: 'restaurantAdmin',
                targetRoleId: customId,
                message: `Store ${String(status.status).toLowerCase()}`,
                emoji: '🛒',
                theme: isVerified ? 'success' : 'info',
                metadata: { message: status.message, days: status.days }
            } as any);
        } catch {}
        
        // Send FCM notification if mart store is being verified (approved)
        if (isVerified && updated) {
            try {
                const martStoreAdmin = await martStoreAdminRepo.findByMartStoreAdminByMartStoreId(customId);
                if (martStoreAdmin?.fcmTokens && martStoreAdmin.fcmTokens.length > 0) {
                    await sendFCMNotification({
                        tokens: martStoreAdmin.fcmTokens.map((token: IFCM) => token.token),
                        title: "🎉 Mart Store Approved!",
                        body: `Your mart store "${updated.martStoreName || 'Mart Store'}" has been verified and approved. You can now start accepting orders!`,
                        data: {
                            type: "martstore_approved",
                            martStoreId: customId,
                            status: "verified"
                        }
                    });
                    console.log(`✅ FCM notification sent for mart store verification: ${customId}`);
                }
            } catch (error) {
                console.error(`❌ Error sending FCM notification for mart store verification: ${customId}`, error);
            }
        }
        
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
