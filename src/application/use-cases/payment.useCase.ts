import { PaymentRepository } from "../../infrastructure/repositories/payment.repository.js";
import { PaymentModel } from "../../infrastructure/db/mongoose/schemas/payment.schema.js";
import { startOfWeek, endOfWeek, format } from "date-fns";

const paymentRepo = new PaymentRepository();

export const PaymentUseCase = {
  async listByRestaurantWeekly(restaurantId: string, weekStartISO?: string) {
    // Determine current week if not provided
    const start = weekStartISO ? new Date(weekStartISO) : startOfWeek(new Date(), { weekStartsOn: 1 });
    const end = endOfWeek(start, { weekStartsOn: 1 });
    const weekKey = format(start, "yyyy-'W'II");

    const payments = await paymentRepo.getPayments({
      "ref.restaurantId": restaurantId,
      "timestamps.paidAt": { $gte: start, $lte: end },
    });

    const totals = payments.reduce(
      (acc, p: any) => {
        acc.total += p.amount?.total || 0;
        acc.restaurant += p.distribution?.restaurant || 0;
        acc.platform += p.distribution?.platform || 0;
        return acc;
      },
      { total: 0, restaurant: 0, platform: 0 }
    );

    return { weekKey, start, end, totals, items: payments };
  },

  async updateSettlementStatus(restaurantId: string, weekKey: string, status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED') {
    const res = await PaymentModel.updateMany(
      { "ref.restaurantId": restaurantId, "settlement.weekKey": weekKey },
      { $set: { "settlement.status": status } }
    );
    // @ts-ignore
    return { matched: res.matchedCount ?? 0, modified: res.modifiedCount ?? 0 } as any;
  },

  async getPaymentDetails(paymentId: string) {
    const payment = await paymentRepo.getPaymentById(paymentId);
    if (!payment) throw new Error("Payment not found");
    return payment;
  },
};


