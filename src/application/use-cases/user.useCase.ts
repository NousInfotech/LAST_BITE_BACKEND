// application/use-cases/user/user.useCase.ts

import { Favourites, IUser } from "../../domain/interfaces/user.interface.js";
import { FavoritesActions, IAddress } from "../../domain/interfaces/utils.interface.js";
import { UserRepository } from "../../infrastructure/repositories/user.repository.js";


const userRepo = new UserRepository();

export const UserUseCase = {
    createUser: (data: IUser) => userRepo.create(data),
    getUserByUserId: (userId: string) => userRepo.findByUserId(userId),
    getUserByPhoneNumber: (phoneNumber: string) => userRepo.findUserByPhoneNumber(phoneNumber),
    updateUser: (userId: string, data: Partial<IUser>) => userRepo.updateUser(userId, data),
    deleteUser: (userId: string) => userRepo.deleteUser(userId),

    addAddress: (userId: string, address: IAddress) => userRepo.addAddress(userId, address),
    getAddresses: (userId: string) => userRepo.getAddresses(userId),
    updateAddress: (userId: string, addressId: string, data: Partial<IAddress>) => userRepo.updateAddress(userId, addressId, data),
    deleteAddress: (userId: string, addressId: string) => userRepo.deleteAddress(userId, addressId),

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
        if (!operation) throw new Error("Invalid action for upadateBlocked Restaurants");

        return operation();
    }

};
