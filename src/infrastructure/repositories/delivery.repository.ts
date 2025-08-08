import { FilterQuery, UpdateQuery } from "mongoose";
import { IDeliveryType, IDeliveryInstruction, IDeliveryPreferences } from "../../domain/interfaces/delivery.interface.js";
import { DeliveryTypeModel, DeliveryTypeDoc } from "../db/mongoose/schemas/deliveryType.schema.js";
import { DeliveryInstructionModel, DeliveryInstructionDoc } from "../db/mongoose/schemas/deliveryInstruction.schema.js";
import { DeliveryPreferencesModel, DeliveryPreferencesDoc } from "../db/mongoose/schemas/deliveryPreferences.schema.js";

export class DeliveryRepository {
  // Delivery Types
  /**
   * Create a new delivery type
   * @param {IDeliveryType} deliveryTypeData - Delivery type data to create
   */
  async createDeliveryType(deliveryTypeData: IDeliveryType): Promise<IDeliveryType> {
    const deliveryType = new DeliveryTypeModel(deliveryTypeData);
    return await deliveryType.save();
  }

  /**
   * Get delivery type by ID
   * @param {string} typeId - Delivery type ID to search for
   */
  async getDeliveryTypeById(typeId: string): Promise<IDeliveryType | null> {
    return await DeliveryTypeModel.findOne({ typeId }, { _id: 0, __v: 0 }).lean();
  }

  /**
   * Get all delivery types
   * @param {boolean} isActive - Filter by active status
   */
  async getDeliveryTypes(isActive?: boolean): Promise<IDeliveryType[]> {
    const filter: FilterQuery<IDeliveryType> = {};
    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    return await DeliveryTypeModel.find(filter, { _id: 0, __v: 0 })
      .sort({ priority: 1, createdAt: -1 })
      .lean();
  }

  /**
   * Update delivery type
   * @param {string} typeId - Delivery type ID to update
   * @param {UpdateQuery<IDeliveryType>} updateData - Data to update
   */
  async updateDeliveryType(typeId: string, updateData: UpdateQuery<IDeliveryType>): Promise<IDeliveryType | null> {
    return await DeliveryTypeModel.findOneAndUpdate(
      { typeId },
      updateData,
      { new: true, projection: { _id: 0, __v: 0 } }
    ).lean();
  }

  /**
   * Delete delivery type
   * @param {string} typeId - Delivery type ID to delete
   */
  async deleteDeliveryType(typeId: string): Promise<boolean> {
    const result = await DeliveryTypeModel.deleteOne({ typeId });
    return result.deletedCount > 0;
  }

  // Delivery Instructions
  /**
   * Create a new delivery instruction
   * @param {IDeliveryInstruction} instructionData - Delivery instruction data to create
   */
  async createDeliveryInstruction(instructionData: IDeliveryInstruction): Promise<IDeliveryInstruction> {
    const instruction = new DeliveryInstructionModel(instructionData);
    return await instruction.save();
  }

  /**
   * Get delivery instruction by ID
   * @param {string} instructionId - Delivery instruction ID to search for
   */
  async getDeliveryInstructionById(instructionId: string): Promise<IDeliveryInstruction | null> {
    return await DeliveryInstructionModel.findOne({ instructionId }, { _id: 0, __v: 0 }).lean();
  }

  /**
   * Get all delivery instructions
   * @param {string} category - Filter by category
   * @param {boolean} isActive - Filter by active status
   */
  async getDeliveryInstructions(category?: string, isActive?: boolean): Promise<IDeliveryInstruction[]> {
    const filter: FilterQuery<IDeliveryInstruction> = {};
    
    if (category) {
      filter.category = category;
    }
    
    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    return await DeliveryInstructionModel.find(filter, { _id: 0, __v: 0 })
      .sort({ priority: 1, createdAt: -1 })
      .lean();
  }

  /**
   * Update delivery instruction
   * @param {string} instructionId - Delivery instruction ID to update
   * @param {UpdateQuery<IDeliveryInstruction>} updateData - Data to update
   */
  async updateDeliveryInstruction(instructionId: string, updateData: UpdateQuery<IDeliveryInstruction>): Promise<IDeliveryInstruction | null> {
    return await DeliveryInstructionModel.findOneAndUpdate(
      { instructionId },
      updateData,
      { new: true, projection: { _id: 0, __v: 0 } }
    ).lean();
  }

  /**
   * Delete delivery instruction
   * @param {string} instructionId - Delivery instruction ID to delete
   */
  async deleteDeliveryInstruction(instructionId: string): Promise<boolean> {
    const result = await DeliveryInstructionModel.deleteOne({ instructionId });
    return result.deletedCount > 0;
  }

  // Delivery Preferences
  /**
   * Save delivery preferences for user
   * @param {string} userId - User ID
   * @param {IDeliveryPreferences} preferences - Delivery preferences data
   */
  async saveDeliveryPreferences(userId: string, preferences: IDeliveryPreferences): Promise<boolean> {
    try {
      await DeliveryPreferencesModel.findOneAndUpdate(
        { userId },
        { ...preferences, updatedAt: new Date() },
        { upsert: true, new: true }
      );
      return true;
    } catch (error) {
      console.error('Error saving delivery preferences:', error);
      return false;
    }
  }

  /**
   * Get delivery preferences for user
   * @param {string} userId - User ID
   */
  async getDeliveryPreferences(userId: string): Promise<IDeliveryPreferences | null> {
    return await DeliveryPreferencesModel.findOne({ userId }, { _id: 0, __v: 0 }).lean();
  }

  /**
   * Update delivery preferences for user
   * @param {string} userId - User ID
   * @param {UpdateQuery<IDeliveryPreferences>} updateData - Data to update
   */
  async updateDeliveryPreferences(userId: string, updateData: UpdateQuery<IDeliveryPreferences>): Promise<IDeliveryPreferences | null> {
    return await DeliveryPreferencesModel.findOneAndUpdate(
      { userId },
      { ...updateData, updatedAt: new Date() },
      { new: true, projection: { _id: 0, __v: 0 } }
    ).lean();
  }

  /**
   * Delete delivery preferences for user
   * @param {string} userId - User ID
   */
  async deleteDeliveryPreferences(userId: string): Promise<boolean> {
    const result = await DeliveryPreferencesModel.deleteOne({ userId });
    return result.deletedCount > 0;
  }

  // Bulk operations
  /**
   * Bulk create delivery types
   * @param {IDeliveryType[]} deliveryTypes - Array of delivery types to create
   */
  async bulkCreateDeliveryTypes(deliveryTypes: IDeliveryType[]): Promise<IDeliveryType[]> {
    return await DeliveryTypeModel.insertMany(deliveryTypes);
  }

  /**
   * Bulk create delivery instructions
   * @param {IDeliveryInstruction[]} instructions - Array of delivery instructions to create
   */
  async bulkCreateDeliveryInstructions(instructions: IDeliveryInstruction[]): Promise<IDeliveryInstruction[]> {
    return await DeliveryInstructionModel.insertMany(instructions);
  }

  /**
   * Get all delivery types and instructions for initialization
   */
  async getAllDeliveryData(): Promise<{
    deliveryTypes: IDeliveryType[];
    instructions: IDeliveryInstruction[];
  }> {
    const [deliveryTypes, instructions] = await Promise.all([
      this.getDeliveryTypes(true),
      this.getDeliveryInstructions(undefined, true)
    ]);

    return {
      deliveryTypes,
      instructions
    };
  }

  /**
   * Check if delivery type exists
   * @param {string} typeId - Delivery type ID
   */
  async deliveryTypeExists(typeId: string): Promise<boolean> {
    const count = await DeliveryTypeModel.countDocuments({ typeId });
    return count > 0;
  }

  /**
   * Check if delivery instruction exists
   * @param {string} instructionId - Delivery instruction ID
   */
  async deliveryInstructionExists(instructionId: string): Promise<boolean> {
    const count = await DeliveryInstructionModel.countDocuments({ instructionId });
    return count > 0;
  }
} 