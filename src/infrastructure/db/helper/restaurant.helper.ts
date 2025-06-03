import { RestaurantDoc } from "../mongoose/schemas/restaurant.schema";
import { Role } from "../../../domain/interfaces/utils.interface.js";

type SanitizedRestaurant = Partial<RestaurantDoc>;

/**
 * Filters a restaurant document based on the requester’s role.
 * @param restaurant - The full restaurant document from DB.
 * @param role - The role of the requester.
 * @returns Filtered restaurant object.
 */
export function sanitizeRestaurantByRole(
  restaurant: RestaurantDoc,
  role: Role
): SanitizedRestaurant {
  const baseFields = {
    restaurantId: restaurant.restaurantId,
    restaurantName: restaurant.restaurantName,
    address: restaurant.address,
    timings: restaurant.timings,
    profilePhoto: restaurant.profilePhoto,
    isActive: restaurant.isActive,
  };

  switch (role) {
    case "user":
      return {
        ...baseFields,
        tags: restaurant.tags,
        cuisines: restaurant.cuisines,
        typeOfFood: restaurant.typeOfFood,
        availableCategories: restaurant.availableCategories,
        rating: restaurant.rating,
      };

    case "rider":
      return {
        ...baseFields,
      };

    case "restaurantAdmin":
      return {
        ...baseFields,
        documents: restaurant.documents,
        tags: restaurant.tags,
        cuisines: restaurant.cuisines,
        typeOfFood: restaurant.typeOfFood,
        availableCategories: restaurant.availableCategories,
        rating: restaurant.rating,
        createdAt: restaurant.createdAt,
        updatedAt: restaurant.updatedAt,
      };

    case "superAdmin":
      return restaurant; // Full access, no filtering

    default:
      return {}; // Or throw an error if needed
  }
}


