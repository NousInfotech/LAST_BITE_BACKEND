import { IMartProduct } from "../../domain/interfaces/martProduct.interface.js";
import { MartProductRepository } from "../../infrastructure/repositories/martProduct.repository.js";
import { MartStoreRepository } from "../../infrastructure/repositories/martStore.repository.js";

const martProductRepo = new MartProductRepository();
const martStoreRepo = new MartStoreRepository();

export const MartProductUseCase = {
  // Create a mart product
  createMartProduct: async (data: IMartProduct) => {
    const { martStoreId} = data;

    const store = await martStoreRepo.findByMartStoreId(martStoreId);
    if (!store) {
      throw new Error(`Mart store with ID "${martStoreId}" does not exist.`);
    }

    // const allowedCategories = store. || [];
    // const allValid = categories.every(cat => allowedCategories.includes(cat.trim().toLowerCase()));

    // if (!allValid) {
    //   throw new Error(`One or more categories are not allowed for this store.`);
    // }

    return await martProductRepo.create(data);
  },

  // Get product by ID
  getMartProductById: (productId: string) => martProductRepo.findByMartProductId(productId),

  // Update
  updateMartProduct: (productId: string, data: Partial<IMartProduct>) =>
    martProductRepo.updateMartProduct(productId, data),

  // Delete
  deleteMartProduct: (productId: string) => martProductRepo.deleteMartProduct(productId),

  // Get all (optional filter)
  getAllMartProducts: (filter: Partial<IMartProduct> = {}) =>
    martProductRepo.getAllMartProducts(filter),

  // Get all by store
  getByMartStoreId: (martStoreId: string) =>
    martProductRepo.getByStoreId(martStoreId),

  // Bulk create
  bulkCreateMartProducts: (data: IMartProduct[]) =>
    martProductRepo.bulkCreate(data),

  // Bulk fetch by IDs
  bulkGetByProductIds: (ids: string[]) =>
    martProductRepo.bulkGetByMartProductIds(ids),

  // Get hot deals (high-rating products)
  getHotDeals: (martStoreId: string, limit: number = 10) =>
    martProductRepo.getHotDeals(martStoreId, limit),
};
