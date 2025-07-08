import { FilterQuery } from "mongoose";
import { IPayment } from "../../domain/interfaces/payment.interface.js";
import { PaymentDoc, PaymentModel } from "../db/mongoose/schemas/payment.schema.js";

export class PaymentRepository {
  async createPayment(paymentData: IPayment): Promise<PaymentDoc> {
    const payment = new PaymentModel(paymentData);
    return await payment.save();
  }

  async getPayments(filter: FilterQuery<IPayment> = {}): Promise<PaymentDoc[]> {
    return await PaymentModel.find(filter, { _id: 0, __v: 0 }).lean();
  }

  async getPaymentById(paymentId: string): Promise<PaymentDoc | null> {
    return await PaymentModel.findOne({ paymentId }, { _id: 0, __v: 0 }).lean();
  }
} 