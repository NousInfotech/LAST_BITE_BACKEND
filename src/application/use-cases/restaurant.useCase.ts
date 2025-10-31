import { RestaurantRepository } from "../../infrastructure/repositories/restaurant.repository.js";
import { sanitizeRestaurantByRole } from "../../infrastructure/db/helper/restaurant.helper.js";
import { IRestaurantStatus, IRestaurant } from "../../domain/interfaces/restaurant.interface.js";
import { UpdateQuery, FilterQuery } from "mongoose";
import { Role } from "../../domain/interfaces/utils.interface.js";
import { RestaurantDoc } from "../../infrastructure/db/mongoose/schemas/restaurant.schema.js";
import { sendRestaurantNotification } from "../../presentation/sockets/restaurantNotification.socket.js";
import { RestaurantStatusEnum } from "../../domain/interfaces/utils.interface.js";
import { sendFCMNotification } from "../services/fcm.service.js";
import { RestaurantAdminRepository } from "../../infrastructure/repositories/restaurantAdmin.repository.js";
import { IFCM } from "../../domain/interfaces/notification.interface.js";

const restaurantRepo = new RestaurantRepository();
const restaurantAdminRepo = new RestaurantAdminRepository();

export const RestaurantUseCase = {
    /**
     * Create a new restaurant
     */
    createRestaurant: (data: IRestaurant) => {
        console.log('=== RESTAURANT USE CASE DEBUG ===');
        console.log('Incoming data profile photo:', data.profilePhoto);
        console.log('Incoming data menu images:', data.menuImages);
        console.log('Incoming data documents:', data.documents);
        console.log('Incoming data PAN image:', data.documents?.panImage);
        console.log('Incoming data shop license image:', data.documents?.shopLicenseImage);
        console.log('Incoming data FSSAI certificate image:', data.documents?.fssaiCertificateImage);
        console.log('Incoming data GST certificate image:', data.documents?.gstCertificateImage);
        console.log('Incoming data cancelled cheque image:', data.documents?.cancelledChequeImage);
        
        // Validate document URLs - reject local file URIs (file:// or content://)
        if (data.documents) {
            const documentFields = ['panImage', 'shopLicenseImage', 'fssaiCertificateImage', 'gstCertificateImage', 'cancelledChequeImage'];
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
        
        // Validate profile photo URL
        if (data.profilePhoto && typeof data.profilePhoto === 'string') {
            if (data.profilePhoto.startsWith('file://') || data.profilePhoto.startsWith('content://')) {
                throw new Error('Invalid profile photo URL. Profile photo must be uploaded to S3 first.');
            }
        }
        
        // Validate menu images URLs
        if (data.menuImages && Array.isArray(data.menuImages)) {
            const invalidMenuUrls = data.menuImages.filter((url: string) => 
                url && typeof url === 'string' && (url.startsWith('file://') || url.startsWith('content://'))
            );
            if (invalidMenuUrls.length > 0) {
                throw new Error('Invalid menu image URLs. Menu images must be uploaded to S3 first.');
            }
        }
        
        return restaurantRepo.create(data);
    },

    /**
     * Get a restaurant by its restaurantId with role-based filtering
     */
    getRestaurantById: async (restaurantId: string, role: Role) => {
        const restaurant = await restaurantRepo.findByRestaurantId(restaurantId);
        return restaurant ? sanitizeRestaurantByRole(restaurant, role) : null;
    },

    /**
     * Get all restaurants with optional filter and role-based filtering
     */
    getAllRestaurants: async (role: Role, filter: FilterQuery<IRestaurant> = {}) => {
        const restaurants = await restaurantRepo.getAllRestaurants(filter);
        return restaurants.map((r: RestaurantDoc) => sanitizeRestaurantByRole(r, role));
    },

    /**
     * Update a restaurant by its ID
     */
    updateRestaurant: async (restaurantId: string, updateData: UpdateQuery<IRestaurant>) => {
        // Validate document URLs - reject local file URIs (file:// or content://)
        if (updateData.documents) {
            const documentFields = ['panImage', 'shopLicenseImage', 'fssaiCertificateImage', 'gstCertificateImage', 'cancelledChequeImage'];
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
        
        // Validate profile photo URL
        if (updateData.profilePhoto && typeof updateData.profilePhoto === 'string') {
            if (updateData.profilePhoto.startsWith('file://') || updateData.profilePhoto.startsWith('content://')) {
                throw new Error('Invalid profile photo URL. Profile photo must be uploaded to S3 first.');
            }
        }
        
        // Validate menu images URLs
        if (updateData.menuImages && Array.isArray(updateData.menuImages)) {
            const invalidMenuUrls = updateData.menuImages.filter((url: string) => 
                url && typeof url === 'string' && (url.startsWith('file://') || url.startsWith('content://'))
            );
            if (invalidMenuUrls.length > 0) {
                throw new Error('Invalid menu image URLs. Menu images must be uploaded to S3 first.');
            }
        }
        
        // Get current restaurant to check if status is being changed to VERIFIED
        const currentRestaurant = await restaurantRepo.findByRestaurantId(restaurantId);
        const updated = await restaurantRepo.updateRestaurant(restaurantId, updateData);
        
        // Send FCM notification if restaurant status is VERIFIED (approved)
        // Check if restaurant status changed to VERIFIED
        if (updated) {
            const currentStatus = currentRestaurant?.restaurantStatus?.status;
            const newStatus = updated.restaurantStatus?.status;
            const isApproved = newStatus === RestaurantStatusEnum.VERIFIED;
            const statusChangedToVerified = isApproved && currentStatus !== RestaurantStatusEnum.VERIFIED;
            
            if (statusChangedToVerified) {
                try {
                    const restaurantAdmin = await restaurantAdminRepo.findByRestaurantAdminByRestaurantId(restaurantId);
                    if (restaurantAdmin?.fcmTokens && restaurantAdmin.fcmTokens.length > 0) {
                        await sendFCMNotification({
                            tokens: restaurantAdmin.fcmTokens.map((token: IFCM) => token.token),
                            title: "🎉 Restaurant Approved!",
                            body: `Your restaurant "${updated.restaurantName || 'Restaurant'}" has been approved and is now active on LastBite. You can now start accepting orders!`,
                        data: {
                            type: "restaurant_approved",
                            restaurantId: restaurantId,
                            status: "verified"
                        }
                        });
                        console.log(`✅ FCM notification sent for restaurant approval: ${restaurantId}`);
                    }
                } catch (error) {
                    console.error(`❌ Error sending FCM notification for restaurant approval: ${restaurantId}`, error);
                }
            }
        }
        
        return updated;
    },
    /**
      * Update a restaurant status by id
      */
    updateRestaurantStatus: async (restaurantId: string, state: IRestaurantStatus) => {
        const isVerified = state.status === RestaurantStatusEnum.VERIFIED;
        const updated = await restaurantRepo.updateRestaurantStatus(restaurantId, state.status, state.message, state.days);
        
        try {
            sendRestaurantNotification(restaurantId, {
                type: 'system',
                targetRole: 'restaurantAdmin',
                targetRoleId: restaurantId,
                message: `Store ${state.status.toLowerCase()}`,
                emoji: '🏪',
                theme: isVerified ? 'success' : 'warning',
                metadata: { message: state.message, days: state.days }
            } as any);
        } catch {}
        
        // Send FCM notification if restaurant is being verified (approved)
        if (isVerified && updated) {
            try {
                const restaurantAdmin = await restaurantAdminRepo.findByRestaurantAdminByRestaurantId(restaurantId);
                if (restaurantAdmin?.fcmTokens && restaurantAdmin.fcmTokens.length > 0) {
                    await sendFCMNotification({
                        tokens: restaurantAdmin.fcmTokens.map((token: IFCM) => token.token),
                        title: "🎉 Restaurant Approved!",
                        body: `Your restaurant "${updated.restaurantName || 'Restaurant'}" has been verified and approved. You can now start accepting orders!`,
                        data: {
                            type: "restaurant_approved",
                            restaurantId: restaurantId,
                            status: "verified"
                        }
                    });
                    console.log(`✅ FCM notification sent for restaurant verification: ${restaurantId}`);
                }
            } catch (error) {
                console.error(`❌ Error sending FCM notification for restaurant verification: ${restaurantId}`, error);
            }
        }
        
        return updated;
    },


    /**
     * Delete a restaurant by its ID
     */
    deleteRestaurant: async (restaurantId: string) => {
        // Delete the associated restaurant admin first
        const admin = await restaurantAdminRepo.findByRestaurantAdminByRestaurantId(restaurantId);
        if (admin && admin.restaurantAdminId) {
            await restaurantAdminRepo.deleteAdmin(admin.restaurantAdminId);
        }
        return restaurantRepo.deleteRestaurant(restaurantId);
    },

    /**
     * Bulk insert multiple restaurants
     */
    bulkCreateRestaurants: (restaurants: IRestaurant[]) => {
        return restaurantRepo.bulkCreate(restaurants);
    },

    /**
     * Bulk get restaurants by IDs with role-based filtering
     */
    bulkGetByRestaurantIds: async (restaurantIds: string[], role: Role) => {
        const restaurants = await restaurantRepo.bulkGetByRestaurantIds(restaurantIds);
        return restaurants.map((r: RestaurantDoc) => sanitizeRestaurantByRole(r, role));
    },

    /**
     * Search restaurants and dishes with verified status
     */
    searchRestaurantsAndDishes: async (searchParams: {
        search?: string;
        rating?: number; // optional; if omitted, do not enforce min rating
        limit?: number;
        page?: number;
    }, role: Role) => {
        try {
            const { search, rating, limit = 10, page = 1 } = searchParams;
            
            // Get verified restaurants only
            const verifiedRestaurants = await restaurantRepo.getVerifiedRestaurants({
                search,
                rating,
                limit,
                page
            });

            // Get dishes from verified restaurants
            const dishes = await restaurantRepo.getDishesFromVerifiedRestaurants({
                search,
                rating,
                limit,
                page
            });

            return {
                restaurants: verifiedRestaurants.map((r: RestaurantDoc) => sanitizeRestaurantByRole(r, role)),
                dishes,
                totalRestaurants: verifiedRestaurants.length,
                totalDishes: dishes.length
            };
        } catch (error) {
            console.error('Error in searchRestaurantsAndDishes:', error);
            throw error;
        }
    },
};
