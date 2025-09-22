import { FilterQuery } from "mongoose";
import { IOrder, IOrderFeedback } from "../../domain/interfaces/order.interface.js";
import { OrderDoc, OrderModel } from "../db/mongoose/schemas/order.schema.js";
import { extractQueryOptions } from "../db/helper/utils.helper.js";

export class OrderRepository {
  async createOrder(orderData: IOrder): Promise<OrderDoc> {
    const order = new OrderModel(orderData);
    return await order.save();
  }

  async updateOrderStatus(orderId: string, status: IOrder["orderStatus"]) {
    return await OrderModel.findOneAndUpdate(
      { orderId },
      { orderStatus: status, updatedAt: new Date() },
      { new: true }
    ).lean();
  }

  async setOrderFeedback(orderId: string, feedback: IOrderFeedback) {
    return await OrderModel.findOneAndUpdate(
      { orderId },
      { feedback: feedback, updatedAt: new Date() },
      { new: true }
    )
  }

  async getOrders(filter: FilterQuery<IOrder> = {}): Promise<OrderDoc[]> {
    const { sortBy, order, page, limit, search, ...pureFilter } = filter;

    // Build MongoDB filter object
    if (search) {
      pureFilter.orderId = { $regex: `^${search}`, $options: "i" };
    }
    const queryOptions = extractQueryOptions({ sortBy, order, page, limit });
    // Extract pagination/sorting options

    return await OrderModel.find(pureFilter, { _id: 0, __v: 0 })
      .sort(queryOptions.sort)
      .skip(queryOptions.skip || 0)
      .limit(queryOptions.limit || 10)
      .lean();
  }

  async getOrderByPidgeId(pidgeId: string): Promise<OrderDoc | null> {
    return await OrderModel.findOne({ "delivery.pidge.pidgeId": pidgeId }, { _id: 0, __v: 0 }).lean();
  }

  async getOrderById(orderId: string): Promise<OrderDoc | null> {
    return await OrderModel.findOne({ orderId }, { _id: 0, __v: 0 }).lean();
  }

  async getOrdersByMartStoreId(martStoreId: string): Promise<OrderDoc[]> {
    return await OrderModel.find(
      { "refIds.restaurantId": martStoreId },
      { _id: 0, __v: 0 }
    ).lean();
  }

  async getOrdersByRestaurantId(restaurantId: string): Promise<OrderDoc[]> {
    return await OrderModel.find(
      { "refIds.restaurantId": restaurantId },
      { _id: 0, __v: 0 }
    ).lean();
  }

  async updatePaymentId(orderId: string, paymentId: string) {
    return await OrderModel.findOneAndUpdate(
      { orderId },
      { $set: { "payment.paymentId": paymentId } },
      { new: true } // to return the updated document
    ).lean();
  }

} 