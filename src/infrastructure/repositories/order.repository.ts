import { FilterQuery } from "mongoose";
import { IOrder } from "../../domain/interfaces/order.interface.js";
import { OrderDoc, OrderModel } from "../db/mongoose/schemas/order.schema.js";

export class OrderRepository {
  async createOrder(orderData: IOrder): Promise<OrderDoc> {
    const order = new OrderModel(orderData);
    return await order.save();
  }

  async getOrders(filter: FilterQuery<IOrder> = {}): Promise<OrderDoc[]> {
    return await OrderModel.find(filter, { _id: 0, __v: 0 }).lean();
  }

  async getOrderById(orderId: string): Promise<OrderDoc | null> {
    return await OrderModel.findOne({ orderId }, { _id: 0, __v: 0 }).lean();
  }
} 