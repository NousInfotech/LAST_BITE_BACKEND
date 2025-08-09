import { RestaurantDoc } from "../mongoose/schemas/restaurant.schema.js";
import { RestaurantStatusEnum, Role } from "../../../domain/interfaces/utils.interface.js";

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
        menuImages: restaurant.menuImages,
      };

    case "rider":
      return {
        ...baseFields,
      };

    case "restaurantAdmin":
      return {
        ...baseFields,
        restaurantStatus: restaurant.restaurantStatus,
        documents: restaurant.documents,
        tags: restaurant.tags,
        cuisines: restaurant.cuisines,
        typeOfFood: restaurant.typeOfFood,
        availableCategories: restaurant.availableCategories,
        rating: restaurant.rating,
        packagingCharges: restaurant.packagingCharges,
        menuImages: restaurant.menuImages,
        createdAt: restaurant.createdAt,
        updatedAt: restaurant.updatedAt,
      };

    case "superAdmin":
      return restaurant; // Full access, no filtering

    default:
      // Treat unknown/unauthenticated roles as regular users to allow public search/listing
      return {
        ...baseFields,
        tags: restaurant.tags,
        cuisines: restaurant.cuisines,
        typeOfFood: restaurant.typeOfFood,
        availableCategories: restaurant.availableCategories,
        rating: restaurant.rating,
        menuImages: restaurant.menuImages,
      };
  }
}

const validTransitions: Record<RestaurantStatusEnum, RestaurantStatusEnum[]> = {
  [RestaurantStatusEnum.PENDING]: [RestaurantStatusEnum.VERIFIED, RestaurantStatusEnum.REJECTED],
  [RestaurantStatusEnum.VERIFIED]: [RestaurantStatusEnum.SUSPENDED, RestaurantStatusEnum.BANNED],
  [RestaurantStatusEnum.REJECTED]: [RestaurantStatusEnum.VERIFIED],
  [RestaurantStatusEnum.SUSPENDED]: [RestaurantStatusEnum.VERIFIED],
  [RestaurantStatusEnum.BANNED]: [RestaurantStatusEnum.VERIFIED],
};

export function isValidStatusTransition(
  current: RestaurantStatusEnum | undefined,
  next: RestaurantStatusEnum
): boolean {
  const from = current ?? RestaurantStatusEnum.PENDING;
  return validTransitions[from]?.includes(next);
}



