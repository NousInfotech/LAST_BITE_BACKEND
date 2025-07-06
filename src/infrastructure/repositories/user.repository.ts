import { FilterQuery, UpdateQuery } from "mongoose";
import { Favourites, IUser, IUserCart, IUserCollection } from "../../domain/interfaces/user.interface.js";
import { IAddress } from "../../domain/interfaces/utils.interface.js";
import { UserCollectionModel, UserDoc, UserModel } from "../db/mongoose/schemas/user.schema.js";
import { extractQueryOptions } from "../db/helper/utils.helper.js";

export class UserRepository {
    /**
     * Create a new user
     * @param {IUser} userData - User data to create
     */
    async create(userData: IUser) {
        const user = new UserModel(userData);
        return await user.save();
    }

    /**
     * Get a user by their userId
     * @param {string} userId - Custom userId to search for
     */
    async findByUserId(userId: IUser['userId']) {
        return await UserModel.findOne({ userId }, { _id: 0, __v: 0 }).lean();
    }
    /**
     * Get a user by their userId
     * @param {string} phoneNumber - Custom userId to search for
     */
    async findUserByPhoneNumber(phoneNumber: IUser['phoneNumber']) {
        return await UserModel.findOne({ phoneNumber }, { _id: 0, __v: 0 }).lean();
    }

    /**
     * Update user data
     * @param {string} userId - Custom userId to update
     * @param {UpdateQuery<IUser>} updateData - Data to update
     */
    async updateUser(userId: string, updateData: UpdateQuery<IUser>) {
        return await UserModel.findOneAndUpdate({ userId }, updateData, { new: true });
    }

    /**
     * Add restaurant to favourites
     * @param {string} userId - User's custom ID
     * @param {Favourites} favourites - Favourite Restaurant and FoodItem Array of Id to add
     */
    async addFavourite(userId: string, favourites: Favourites) {
        const updateOps: any = {};

        if (favourites.restaurants && favourites.restaurants.length > 0) {
            updateOps["favourites.restaurants"] = { $each: favourites.restaurants };
        }

        if (favourites.foodItems && favourites.foodItems.length > 0) {
            updateOps["favourites.foodItems"] = { $each: favourites.foodItems };
        }

        if (Object.keys(updateOps).length === 0) {
            return; // Nothing to update
        }

        return await this.updateUser(userId, {
            $addToSet: updateOps,
        });
    }


    /**
     * Remove restaurant from favourites
     * @param {string} userId - User's custom ID
     * @param {Favourites} favourites - Favourite Restaurant and FoodItem Array of Id to remove
     */
    async removeFavourite(userId: string, favourites: Favourites) {
        const updateOps: any = {};

        if (favourites.restaurants && favourites.restaurants.length > 0) {
            updateOps["favourites.restaurants"] = { $in: favourites.restaurants };
        }

        if (favourites.foodItems && favourites.foodItems.length > 0) {
            updateOps["favourites.foodItems"] = { $in: favourites.foodItems };
        }

        if (Object.keys(updateOps).length === 0) {
            return; // Nothing to update
        }

        return await this.updateUser(userId, {
            $pull: updateOps,
        });
    }

    /**
     * Add restaurant to Blcoked in user
     * @param {string} userId - User's custom ID
     * @param {Favourites} blockedRestaurants - Blocked Restaurants Id to be hidden
     */

    async addHiddenRestaurant(userId: string, restaurantIds: string[]) {
        return await this.updateUser(userId, {
            $addToSet: {
                hiddenRestaurants: { $each: restaurantIds },
            },
        });
    }

    /**
    * Remove restaurant to Blcoked in user
    * @param {string} userId - User's custom ID
    * @param {Favourites} blockedRestaurants - Blocked Restaurants Id to be hidden
    */

    async removeHiddenRestaurant(userId: string, restaurantIds: string[]) {
        return await this.updateUser(userId, {
            $pull: {
                hiddenRestaurants: { $in: restaurantIds },
            },
        });
    }


    /**
     * Delete a user
     * @param {string} userId - Custom userId to delete
     */
    async deleteUser(userId: string) {
        return await UserModel.findOneAndDelete({ userId });
    }

    /**
     * Get all users with optional filter
     * @param {FilterQuery<IUser>} [filter={}] - Mongoose filter object
     */
    async getAllUsers(filter: FilterQuery<IUser> = {}) {
        return await UserModel.find(filter, { _id: 0, __v: 0 }).lean();
    }

    /**
     * Bulk seed users
     * @param {IUser[]} users - Array of users to create
     */
    async bulkCreate(users: IUser[]) {
        return await UserModel.insertMany(users, { ordered: false });
    }

    /**
     * Bulk fetch users by userIds
     * @param {string[]} userIds - Array of custom userIds
     */
    async bulkGetByUserIds(userIds: string[]) {
        return await UserModel.find({ userId: { $in: userIds } }, { _id: 0, __v: 0 }).lean();
    }

    // -------------------------
    // 🏠 Address Management
    // -------------------------

    /**
     * Add a new address for the user
     * @param {string} userId - User ID to add address for
     * @param {IAddress} address - Address object to add
     */
    async addAddress(userId: string, address: IAddress) {
        const user = await UserModel.findOne({ userId });
        if (!user) return null;
        if (!user.addresses) return null;
        user.addresses.push(address);
        await user.save();
        return user.addresses;
    }

    /**
     * Get all addresses of the user
     * @param {string} userId - User ID to get addresses for
     */
    async getAddresses(userId: string) {
        const user = await UserModel.findOne({ userId }, { "addresses._id": 0 }).lean();
        return user?.addresses || [];
    }

    /**
     * Update a specific address by its ID
     * @param {string} userId - User ID
     * @param {string} addressId - Address subdocument ID
     * @param {Partial<IAddress>} update - Partial address update object
     */
    async updateAddress(userId: string, addressId: string, update: Partial<IAddress>) {
        const user = await UserModel.findOne({ userId }) as UserDoc;
        if (!user) return null;
        if (!user.addresses) return null;
        const address = user.addresses.id(addressId);
        if (!address) return null;

        address.set(update);
        await user.save();

        return user.addresses;
    }

    /**
     * Delete a specific address by its ID
     * @param {string} userId - User ID
     * @param {string} addressId - Address subdocument ID
     */
    async deleteAddress(userId: string, addressId: string) {
        const user = await UserModel.findOne({ userId }) as UserDoc;
        if (!user?.addresses) return null;

        user.addresses.pull({ _id: addressId });
        await user.save();

        return user.addresses;
    }

    /**
  * GET: Fetch all collections with optional filters (pagination + search)
  */
    async getAllCollections(filter: FilterQuery<IUserCollection> & Record<string, any> = {}) {
        const { sortBy = "createdAt", order = "desc", page = 1, limit = 10, search, ...pureFilter } = filter;

        if (search) {
            pureFilter.name = { $regex: search, $options: "i" };
        }

        const queryOptions = extractQueryOptions({ sortBy, order, page, limit });

        return await UserCollectionModel.find(pureFilter, { _id: 0, __v: 0 })
            .sort(queryOptions.sort)
            .skip(queryOptions.skip as number)
            .limit(queryOptions.limit as number)
            .lean();
    }

    /**
     * GET: Fetch a single collection by ID
     */
    async getCollectionById(collectionId: string) {
        return await UserCollectionModel.findById(collectionId, { _id: 0, __v: 0 }).lean()
    }

    /**
     * POST: Create a new user collection
     */
    async createCollection(data: IUserCollection) {
        const newCollection = new UserCollectionModel(data);
        return await newCollection.save();
    }

    /**
  * PUT: Update a user collection by custom collectionId
  */
    async updateCollection(collectionId: string, updateData: UpdateQuery<IUserCollection>) {
        return await UserCollectionModel.findOneAndUpdate(
            { collectionId },               // filter by custom ID
            updateData,
            { new: true }
        ).lean();
    }

    /**
     * DELETE: Remove a user collection by custom collectionId
     */
    async deleteCollection(collectionId: string) {
        return await UserCollectionModel.findOneAndDelete({ collectionId }).lean();
    }

    /**
     * DELETE: Remove a specific foodItem from a collection using custom collectionId
     */
    async removeFoodItem(collectionId: string, foodItemId: string) {
        console.log(collectionId, foodItemId);
        return await UserCollectionModel.findOneAndUpdate(
            { collectionId },
            { $pull: { foodItemIds: foodItemId } },
            { new: true }
        ).lean();
    }

    /**
      * GET: Fetch cart items for a given user
    **/
    async getCartItems(userId: string): Promise<IUserCart[]> {
        const user = await UserModel.findOne({ userId }, { cart: 1 });

        if (!user) throw new Error("User not found");

        return user.cart;
    }
    /**
    * DELETE: Remove a specific foodItem from a collection using custom collectionId
    */

   async patchCartItems(userId: string, items: IUserCart[]) {
    const user = await UserModel.findOne({ userId });
    if (!user || !user.cart) throw new Error("User not found");

    // 1. Deduplicate existing cart (if any duplicates somehow got in earlier)
    const uniqueCartMap = new Map<string, IUserCart>();
    for (const item of user.cart) {
        uniqueCartMap.set(item.foodItemId, item); // latest one wins
    }
    user.cart = Array.from(uniqueCartMap.values());

    // 2. Apply patch logic
    for (const payload of items) {
        const index = user.cart.findIndex((c) => c.foodItemId === payload.foodItemId);

        if (payload.quantity <= 0) {
            if (index !== -1) {
                user.cart.splice(index, 1); // remove
            }
        } else {
            if (index !== -1) {
                user.cart[index].quantity = payload.quantity; // update
            } else {
                user.cart.push({
                    foodItemId: payload.foodItemId,
                    quantity: payload.quantity
                });
            }
        }
    }

    await user.save();
    return user.cart;
}

}
