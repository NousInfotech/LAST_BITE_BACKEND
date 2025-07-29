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
   * Find a mart product by its martProductId
   * @param {string} martProductId
   * @returns {Promise<MartProductDoc | null>}
   */
  async findByMartProductId(
    martProductId: string
  ): Promise<MartProductDoc | null> {
    return await MartProductModel.findOne(
      { martProductId },
      { _id: 0, __v: 0 }
    ).lean();
  }

  /**
   * Update a mart product by its martProductId
   * @param {string} martProductId
   * @param {UpdateQuery<IMartProduct>} updateData
   * @returns {Promise<MartProductDoc | null>}
   */
  async updateMartProduct(
    martProductId: string,
    updateData: UpdateQuery<IMartProduct>
  ): Promise<MartProductDoc | null> {
    return await MartProductModel.findOneAndUpdate(
      { martProductId },
      updateData,
      { new: true }
    );
  }

  /**
   * Delete a mart product by its martProductId
   * @param {string} martProductId
   * @returns {Promise<MartProductDoc | null>}
   */
  async deleteMartProduct(
    martProductId: string
  ): Promise<MartProductDoc | null> {
    return await MartProductModel.findOneAndDelete({ martProductId });
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

    return await MartProductModel.find(pureFilter, { _id: 0, __v: 0 })
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
      { storeId },
      { _id: 0, __v: 0 }
    ).lean();
  }
}
