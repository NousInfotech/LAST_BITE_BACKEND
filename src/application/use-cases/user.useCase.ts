import { Favourites, IUser, IUserCart, IUserCollection } from "../../domain/interfaces/user.interface.js";
import { FavoritesActions, IAddress } from "../../domain/interfaces/utils.interface.js";
import { UserRepository } from "../../infrastructure/repositories/user.repository.js";
import { UpdateQuery, FilterQuery } from "mongoose";

const userRepo = new UserRepository();

export const UserUseCase = {
    // User CRUD
    createUser: (data: IUser) => userRepo.create(data),
    getUserByUserId: (userId: string) => userRepo.findByUserId(userId),
    getUserByPhoneNumber: (phoneNumber: string) => userRepo.findUserByPhoneNumber(phoneNumber),
    updateUser: (userId: string, data: Partial<IUser>) => userRepo.updateUser(userId, data),
    deleteUser: (userId: string) => userRepo.deleteUser(userId),

    // Addresses
    addAddress: (userId: string, address: IAddress) => userRepo.addAddress(userId, address),
    getAddresses: (userId: string) => userRepo.getAddresses(userId),
    updateAddress: (userId: string, addressId: string, data: Partial<IAddress>) =>
        userRepo.updateAddress(userId, addressId, data),
    deleteAddress: (userId: string, addressId: string) => userRepo.deleteAddress(userId, addressId),

    // Favourites
    updateFavourites: (userId: string, favourites: Favourites, action: FavoritesActions) => {
        const actionsMap = {
            [FavoritesActions.ADD]: () => userRepo.addFavourite(userId, favourites),
            [FavoritesActions.REMOVE]: () => userRepo.removeFavourite(userId, favourites),
        };

        const operation = actionsMap[action];
        if (!operation) throw new Error("Invalid action for updateFavourites");

        return operation();
    },

    updateBlockedRestaurans: (userId: string, blocked: string[], action: FavoritesActions) => {
        const actionsMap = {
            [FavoritesActions.ADD]: () => userRepo.addHiddenRestaurant(userId, blocked),
            [FavoritesActions.REMOVE]: () => userRepo.removeHiddenRestaurant(userId, blocked),
        };

        const operation = actionsMap[action];
        if (!operation) throw new Error("Invalid action for updateBlocked Restaurants");

        return operation();
    },

    // Collection CRUD
    createCollection: (data: IUserCollection) => userRepo.createCollection(data),
    getCollections: (filter: FilterQuery<IUserCollection> & Record<string, any> = {}) =>
        userRepo.getAllCollections(filter),
    getCollectionById: (collectionId: string) => userRepo.getCollectionById(collectionId),
    updateCollection: (collectionId: string, updateData: UpdateQuery<IUserCollection>) =>
        userRepo.updateCollection(collectionId, updateData),
    deleteCollection: (collectionId: string) => userRepo.deleteCollection(collectionId),
    removeFoodItemFromCollection: (collectionId: string, foodItemId: string) =>
        userRepo.removeFoodItem(collectionId, foodItemId),

    // cart operations 
    // can perform crud (except foodItemId) on the cart items in multiple
    getUserCart: (userId: string) => userRepo.getCartItems(userId),
    updateUserCart: (userId: string, cart: IUserCart[]) => userRepo.patchCartItems(userId, cart),
};
