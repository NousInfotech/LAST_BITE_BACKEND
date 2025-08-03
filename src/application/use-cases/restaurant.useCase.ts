import { RestaurantRepository } from "../../infrastructure/repositories/restaurant.repository.js";
import { sanitizeRestaurantByRole } from "../../infrastructure/db/helper/restaurant.helper.js";
import { IRestaurantStatus, IRestaurant } from "../../domain/interfaces/restaurant.interface.js";
import { UpdateQuery, FilterQuery } from "mongoose";
import { Role } from "../../domain/interfaces/utils.interface.js";
import { RestaurantDoc } from "../../infrastructure/db/mongoose/schemas/restaurant.schema.js";

const restaurantRepo = new RestaurantRepository();

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
    updateRestaurant: (restaurantId: string, updateData: UpdateQuery<IRestaurant>) => {
        return restaurantRepo.updateRestaurant(restaurantId, updateData);
    },
    /**
      * Update a restaurant status by id
      */
    updateRestaurantStatus: (restaurantId: string, state: IRestaurantStatus) => {
        return restaurantRepo.updateRestaurantStatus(restaurantId, state.status, state.message, state.days);
    },


    /**
     * Delete a restaurant by its ID
     */
    deleteRestaurant: (restaurantId: string) => {
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
};
