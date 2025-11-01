import { FilterQuery, UpdateQuery } from "mongoose";
import { IMartProduct } from "../../domain/interfaces/martProduct.interface.js";
import {
  MartProductDoc,
  MartProductModel,
} from "../db/mongoose/schemas/martProduct.schema.js";
import { extractQueryOptions } from "../db/helper/utils.helper.js";

export class MartProductRepository {
  /**
   * Create a new mart product
   * @param {IMartProduct} productData
   * @returns {Promise<MartProductDoc>}
   */
  async create(productData: IMartProduct): Promise<MartProductDoc> {
    const product = new MartProductModel(productData);
    return await product.save();
  }

  /**
   * Find a mart product by its martProductId or MongoDB _id
   * @param {string} martProductId
   * @returns {Promise<MartProductDoc | null>}
   */
  async findByMartProductId(
    martProductId: string
  ): Promise<MartProductDoc | null> {
    console.log(`Searching for product with ID: ${martProductId}`);
    
    // First try to find by martProductId
    let product = await MartProductModel.findOne(
      { martProductId },
      { _id: 0, __v: 0 }
    ).lean();
    
    console.log(`Search by martProductId result:`, product ? 'Found' : 'Not found');
    
    // If not found by martProductId, try to find by MongoDB _id
    if (!product) {
      console.log(`Trying to find by MongoDB _id: ${martProductId}`);
      product = await MartProductModel.findById(martProductId).lean();
      console.log(`Search by _id result:`, product ? 'Found' : 'Not found');
    }
    
    if (product) {
      console.log(`Product found with ID: ${product.martProductId || product._id}`);
    } else {
      console.log(`No product found with any ID type`);
    }
    
    return product;
  }

  /**
   * Update a mart product by its martProductId or MongoDB _id
   * @param {string} martProductId
   * @param {UpdateQuery<IMartProduct>} updateData
   * @returns {Promise<MartProductDoc | null>}
   */
  async updateMartProduct(
    martProductId: string,
    updateData: UpdateQuery<IMartProduct>
  ): Promise<MartProductDoc | null> {
    // First try to update by martProductId
    let product = await MartProductModel.findOneAndUpdate(
      { martProductId },
      updateData,
      { new: true }
    );
    
    // If not found by martProductId, try to update by MongoDB _id
    if (!product) {
      product = await MartProductModel.findByIdAndUpdate(
        martProductId,
        updateData,
        { new: true }
      );
    }
    
    return product;
  }

  /**
   * Delete a mart product by its martProductId or MongoDB _id
   * @param {string} martProductId
   * @returns {Promise<MartProductDoc | null>}
   */
  async deleteMartProduct(
    martProductId: string
  ): Promise<MartProductDoc | null> {
    // First try to delete by martProductId
    let product = await MartProductModel.findOneAndDelete({ martProductId });
    
    // If not found by martProductId, try to delete by MongoDB _id
    if (!product) {
      product = await MartProductModel.findByIdAndDelete(martProductId);
    }
    
    return product;
  }

  /**
   * Get all mart products with optional filters
   * @param {FilterQuery<IMartProduct>} [filter={}]
   * @returns {Promise<MartProductDoc[]>}
   */
  async getAllMartProducts(
    filter: FilterQuery<IMartProduct> = {}
  ): Promise<MartProductDoc[]> {
    const { sortBy, order, page, limit, search, ...pureFilter } = filter;

    if (search) {
      pureFilter.name = { $regex: `^${search}`, $options: "i" };
    }

    const queryOptions = extractQueryOptions({ sortBy, order, page, limit });

    return await MartProductModel.find(pureFilter)
      .sort(queryOptions.sort)
      .skip(queryOptions.skip || 0)
      .limit(queryOptions.limit || 10)
      .lean();
  }

  /**
   * Bulk create mart products
   * @param {IMartProduct[]} products
   * @returns {Promise<MartProductDoc[]>}
   */
  async bulkCreate(products: IMartProduct[]): Promise<MartProductDoc[]> {
    return await MartProductModel.insertMany(products, { ordered: false });
  }

  /**
   * Bulk fetch mart products by martProductIds
   * @param {string[]} martProductIds
   * @returns {Promise<MartProductDoc[]>}
   */
  async bulkGetByMartProductIds(
    martProductIds: string[]
  ): Promise<MartProductDoc[]> {
    return await MartProductModel.find(
      { martProductId: { $in: martProductIds } },
      { _id: 0, __v: 0 }
    ).lean();
  }

  /**
   * Get mart products by storeId
   * @param {string} storeId
   * @returns {Promise<MartProductDoc[]>}
   */
  async getByStoreId(storeId: string): Promise<MartProductDoc[]> {
    return await MartProductModel.find(
      { martStoreId: storeId }
    ).lean();
  }

  /**
   * Get high-rating products for hot deals
   * @param {string} storeId
   * @param {number} limit
   * @returns {Promise<MartProductDoc[]>}
   */
  async getHotDeals(storeId: string, limit: number = 10): Promise<MartProductDoc[]> {
    return await MartProductModel.find(
      { 
        martStoreId: storeId,
        rating: { $exists: true, $gte: 4.0 }, // Products with rating >= 4.0
        isAvailable: true
      }
    )
    .sort({ rating: -1, ratingCount: -1 }) // Sort by rating descending, then by rating count
    .limit(limit)
    .lean();
  }

  /**
   * Get mart products for order processing
   * @param {string[]} martProductIds
   * @returns {Promise<MartProductDoc[]>}
   */
  async getMartProductsForOrder(martProductIds: string[]): Promise<MartProductDoc[]> {
    console.log('Looking for mart products with IDs:', martProductIds);
    
    // Try to find by martProductId first
    let products = await MartProductModel.find(
      { martProductId: { $in: martProductIds } }
    ).lean();
    
    console.log(`Found ${products.length} products by martProductId`);
    
    // If not all products found, try to find by _id
    if (products.length < martProductIds.length) {
      const foundIds = products.map(p => p.martProductId).filter(Boolean);
      const missingIds = martProductIds.filter(id => !foundIds.includes(id));
      
      console.log('Missing IDs, trying to find by _id:', missingIds);
      
      const productsById = await MartProductModel.find(
        { _id: { $in: missingIds } }
      ).lean();
      
      console.log(`Found ${productsById.length} additional products by _id`);
      
      // Combine both results
      products = [...products, ...productsById];
    }
    
    console.log(`Total products found: ${products.length}`);
    return products;
  }

  /**
   * Delete all mart products by store ID
   * @param {string} storeId
   * @returns {Promise<{ deletedCount: number }>}
   */
  async deleteProductsByStoreId(storeId: string): Promise<{ deletedCount: number }> {
    const result = await MartProductModel.deleteMany({ martStoreId: storeId });
    console.log(`Deleted ${result.deletedCount} products for store: ${storeId}`);
    return { deletedCount: result.deletedCount || 0 };
  }
}
