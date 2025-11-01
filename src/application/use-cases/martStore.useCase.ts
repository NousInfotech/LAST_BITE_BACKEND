import { MartStoreRepository } from "../../infrastructure/repositories/martStore.repository.js";
import { IMartStore, IMartStoreStatus } from "../../domain/interfaces/martStore.interface.js";
import { UpdateQuery, FilterQuery } from "mongoose";
import { Role } from "../../domain/interfaces/utils.interface.js";
import { sendRestaurantNotification } from "../../presentation/sockets/restaurantNotification.socket.js";
import { sendFCMNotification } from "../services/fcm.service.js";
import { MartStoreAdminRepository } from "../../infrastructure/repositories/martStoreAdmin.repository.js";
import { RestaurantStatusEnum } from "../../domain/interfaces/utils.interface.js";
import { IFCM } from "../../domain/interfaces/notification.interface.js";
import { MartProductRepository } from "../../infrastructure/repositories/martProduct.repository.js";

const martStoreRepo = new MartStoreRepository();
const martStoreAdminRepo = new MartStoreAdminRepository();
const martProductRepo = new MartProductRepository();

export const MartStoreUseCase = {
    /**
     * Create a new mart store
     */
    createMartStore: (data: IMartStore) => {
        // Validate document URLs - reject local file URIs (file:// or content://)
        if (data.documents) {
            const documentFields = ['gstCertificateImage', 'tradeLicenseImage', 'cancelledChequeImage'];
            const invalidUrls: string[] = [];
            
            for (const field of documentFields) {
                const url = data.documents[field as keyof typeof data.documents];
                // Allow empty strings, but reject local file URIs
                if (url && typeof url === 'string' && url.trim() !== '') {
                    if (url.startsWith('file://') || url.startsWith('content://')) {
                        invalidUrls.push(field);
                        console.error(`❌ [VALIDATION] Rejected local file URI for ${field}: ${url.substring(0, 50)}...`);
                    }
                }
            }
            
            if (invalidUrls.length > 0) {
                throw new Error(`Invalid document URLs detected. Documents must be uploaded to S3 first. Invalid fields: ${invalidUrls.join(', ')}`);
            }
        }
        
        // Validate store logo URL
        if (data.storeLogo && typeof data.storeLogo === 'string') {
            if (data.storeLogo.startsWith('file://') || data.storeLogo.startsWith('content://')) {
                throw new Error('Invalid store logo URL. Store logo must be uploaded to S3 first.');
            }
        }
        
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
        // Validate document URLs - reject local file URIs (file:// or content://)
        if (updateData.documents) {
            const documentFields = ['gstCertificateImage', 'tradeLicenseImage', 'cancelledChequeImage'];
            const invalidUrls: string[] = [];
            
            for (const field of documentFields) {
                const url = updateData.documents[field as keyof typeof updateData.documents];
                // Allow empty strings, but reject local file URIs
                if (url && typeof url === 'string' && url.trim() !== '') {
                    if (url.startsWith('file://') || url.startsWith('content://')) {
                        invalidUrls.push(field);
                        console.error(`❌ [VALIDATION] Rejected local file URI for ${field}: ${url.substring(0, 50)}...`);
                    }
                }
            }
            
            if (invalidUrls.length > 0) {
                throw new Error(`Invalid document URLs detected. Documents must be uploaded to S3 first. Invalid fields: ${invalidUrls.join(', ')}`);
            }
        }
        
        // Validate store logo URL
        if (updateData.storeLogo && typeof updateData.storeLogo === 'string') {
            if (updateData.storeLogo.startsWith('file://') || updateData.storeLogo.startsWith('content://')) {
                throw new Error('Invalid store logo URL. Store logo must be uploaded to S3 first.');
            }
        }
        
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
     * Delete a mart store and all associated data
     * This will delete:
     * 1. All mart products associated with the store
     * 2. The mart store admin
     * 3. The mart store itself
     */
    deleteMartStore: async (customId: string) => {
        console.log(`🗑️ Starting deletion process for mart store: ${customId}`);
        
        // 1. Delete all products associated with this mart store
        try {
            const productDeleteResult = await martProductRepo.deleteProductsByStoreId(customId);
            console.log(`✅ Deleted ${productDeleteResult.deletedCount} products for mart store: ${customId}`);
        } catch (error) {
            console.error(`❌ Error deleting products for mart store ${customId}:`, error);
            // Continue with deletion even if products deletion fails
        }
        
        // 2. Delete the associated mart store admin
        try {
            const admin = await martStoreAdminRepo.findByMartStoreAdminByMartStoreId(customId);
            if (admin && admin.martStoreAdminId) {
                await martStoreAdminRepo.deleteAdmin(admin.martStoreAdminId);
                console.log(`✅ Deleted mart store admin: ${admin.martStoreAdminId}`);
            } else {
                console.log(`⚠️ No mart store admin found for mart store: ${customId}`);
            }
        } catch (error) {
            console.error(`❌ Error deleting mart store admin for ${customId}:`, error);
            // Continue with deletion even if admin deletion fails
        }
        
        // 3. Delete the mart store itself
        const deletedStore = await martStoreRepo.deleteMartStore(customId);
        if (deletedStore) {
            console.log(`✅ Successfully deleted mart store: ${customId}`);
        } else {
            console.log(`⚠️ Mart store not found or already deleted: ${customId}`);
        }
        
        return deletedStore;
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
