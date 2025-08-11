// Temporarily commented out due to missing dependencies
// TODO: Implement delivery system interfaces and schemas
/*
import { FilterQuery, UpdateQuery } from "mongoose";
import { IDeliveryType, IDeliveryInstruction, IDeliveryPreferences } from "../../domain/interfaces/delivery.interface.js";
import { DeliveryTypeModel, DeliveryTypeDoc } from "../db/mongoose/schemas/deliveryType.schema.js";
import { DeliveryInstructionModel, DeliveryInstructionDoc } from "../db/mongoose/schemas/deliveryInstruction.schema.js";
import { DeliveryPreferencesModel, DeliveryPreferencesDoc } from "../db/mongoose/schemas/deliveryPreferences.schema.js";

export class DeliveryRepository {
  // Delivery Types
  async createDeliveryType(deliveryTypeData: IDeliveryType): Promise<IDeliveryType> {
    const deliveryType = new DeliveryTypeModel(deliveryTypeData);
    return await deliveryType.save();
  }

  async getDeliveryTypeById(typeId: string): Promise<IDeliveryType | null> {
    return await DeliveryTypeModel.findOne({ typeId }, { _id: 0, __v: 0 }).lean();
  }

  async getDeliveryTypes(isActive?: boolean): Promise<IDeliveryType[]> {
    const filter: FilterQuery<IDeliveryType> = {};
    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    return await DeliveryTypeModel.find(filter, { _id: 0, __v: 0 })
      .sort({ priority: 1, createdAt: -1 })
      .lean();
  }

  async updateDeliveryType(typeId: string, updateData: UpdateQuery<IDeliveryType>): Promise<IDeliveryType | null> {
    return await DeliveryTypeModel.findOneAndUpdate(
      { typeId },
      updateData,
      { new: true, projection: { _id: 0, __v: 0 } }
    ).lean();
  }

  async deleteDeliveryType(typeId: string): Promise<boolean> {
    const result = await DeliveryTypeModel.deleteOne({ typeId });
    return result.deletedCount > 0;
  }

  // Delivery Instructions
  async createDeliveryInstruction(instructionData: IDeliveryInstruction): Promise<IDeliveryInstruction> {
    const instruction = new DeliveryInstructionModel(instructionData);
    return await instruction.save();
  }

  async getDeliveryInstructionById(instructionId: string): Promise<IDeliveryInstruction | null> {
    return await DeliveryInstructionModel.findOne({ instructionId }, { _id: 0, __v: 0 }).lean();
  }

  async getDeliveryInstructions(category?: string, isActive?: boolean): Promise<IDeliveryInstruction[]> {
    const filter: FilterQuery<IDeliveryInstruction> = {};
    
    if (category) {
      filter.category = category;
    }
    
    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    return await DeliveryTypeModel.find(filter, { _id: 0, __v: 0 })
      .sort({ priority: 1, createdAt: -1 })
      .lean();
  }

  async updateDeliveryInstruction(instructionId: string, updateData: UpdateQuery<IDeliveryInstruction>): Promise<IDeliveryInstruction | null> {
    return await DeliveryInstructionModel.findOneAndUpdate(
      { instructionId },
      updateData,
      { new: true, projection: { _id: 0, __v: 0 } }
    ).lean();
  }

  async deleteDeliveryInstruction(instructionId: string): Promise<boolean> {
    const result = await DeliveryInstructionModel.deleteOne({ instructionId });
    return result.deletedCount > 0;
  }

  // Delivery Preferences
  async saveDeliveryPreferences(userId: string, preferences: IDeliveryPreferences): Promise<boolean> {
    try {
      await DeliveryPreferencesModel.findOneAndUpdate(
        { userId },
        preferences,
        { upsert: true, new: true }
      );
      return true;
    } catch (error) {
      console.error('Error saving delivery preferences:', error);
      return false;
    }
  }

  async getDeliveryPreferences(userId: string): Promise<IDeliveryPreferences | null> {
    return await DeliveryPreferencesModel.findOne({ userId }, { _id: 0, __v: 0 }).lean();
  }

  async updateDeliveryPreferences(userId: string, updateData: UpdateQuery<IDeliveryPreferences>): Promise<IDeliveryPreferences | null> {
    return await DeliveryPreferencesModel.findOneAndUpdate(
      { userId },
      updateData,
      { new: true, projection: { _id: 0, __v: 0 } }
    ).lean();
  }

  async deleteDeliveryPreferences(userId: string): Promise<boolean> {
    const result = await DeliveryPreferencesModel.deleteOne({ userId });
    return result.deletedCount > 0;
  }

  // Bulk operations
  async bulkCreateDeliveryTypes(deliveryTypes: IDeliveryType[]): Promise<IDeliveryType[]> {
    return await DeliveryTypeModel.insertMany(deliveryTypes);
  }

  async bulkCreateDeliveryInstructions(instructions: IDeliveryInstruction[]): Promise<IDeliveryInstruction[]> {
    return await DeliveryInstructionModel.insertMany(instructions);
  }

  // Utility methods
  async getAllDeliveryData(): Promise<{
    deliveryTypes: IDeliveryType[];
    instructions: IDeliveryInstruction[];
  }> {
    const [deliveryTypes, instructions] = await Promise.all([
      this.getDeliveryTypes(),
      this.getDeliveryInstructions()
    ]);

    return {
      deliveryTypes,
      instructions
    };
  }

  async deliveryTypeExists(typeId: string): Promise<boolean> {
    const count = await DeliveryTypeModel.countDocuments({ typeId });
    return count > 0;
  }

  async deliveryInstructionExists(instructionId: string): Promise<boolean> {
    const count = await DeliveryInstructionModel.countDocuments({ instructionId });
    return count > 0;
  }
}
*/ 