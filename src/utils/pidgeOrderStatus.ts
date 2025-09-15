import { IOrderStatusEnum } from "../domain/interfaces/order.interface.js";

// Pidge → Your System Mapping
export const pidgeOrderStatusMap: {
    [key: string]: { pidgeOrderStatus: IOrderStatusEnum; description: string };
  } = {
    // ----- Parent Level -----
    CANCELLED: {
      pidgeOrderStatus: IOrderStatusEnum.CANCELLED,
      description: "Order cancelled and cannot be recovered.",
    },
    PENDING: {
      pidgeOrderStatus: IOrderStatusEnum.PENDING,
      description: "Order created but not yet processed for fulfillment.",
    },
    FULFILLED: {
      pidgeOrderStatus: IOrderStatusEnum.CONFIRMED,
      description: "Order marked for fulfillment and AWB manifested.",
    },
    COMPLETED: {
      pidgeOrderStatus: IOrderStatusEnum.DELIVERED,
      description: "Order completed (delivered or RTO delivered).",
    },
  
    // ----- Fulfillment Level -----
    CREATED: {
      pidgeOrderStatus: IOrderStatusEnum.CONFIRMED,
      description: "Order manifested in the fulfillment system.",
    },
    OUT_FOR_PICKUP: {
      pidgeOrderStatus: IOrderStatusEnum.ASSIGNED,
      description: "Rider on the way to pickup location.",
    },
    REACHED_PICKUP: {
      pidgeOrderStatus: IOrderStatusEnum.IN_PROGRESS,
      description: "Rider reached pickup location.",
    },
    PICKED_UP: {
      pidgeOrderStatus: IOrderStatusEnum.PREPARING,
      description: "Rider picked up the order from sender.",
    },
    IN_TRANSIT: {
      pidgeOrderStatus: IOrderStatusEnum.IN_TRANSIT,
      description: "Order in transit via hub/warehouse.",
    },
    OUT_FOR_DELIVERY: {
      pidgeOrderStatus: IOrderStatusEnum.OUT_FOR_DELIVERY,
      description: "Rider is on the way to deliver the order.",
    },
    REACHED_DELIVERY: {
      pidgeOrderStatus: IOrderStatusEnum.IN_PROGRESS,
      description: "Rider reached customer’s delivery location.",
    },
    DELIVERED: {
      pidgeOrderStatus: IOrderStatusEnum.DELIVERED,
      description: "Order successfully delivered to customer.",
    },
    UNDELIVERED: {
      pidgeOrderStatus: IOrderStatusEnum.FAILED,
      description: "Delivery attempt failed; eligible for reattempt or RTO.",
    },
    RTO_OUT_FOR_DELIVERY: {
      pidgeOrderStatus: IOrderStatusEnum.OUT_FOR_DELIVERY,
      description: "Order is out for return delivery back to origin.",
    },
    RTO_UNDELIVERED: {
      pidgeOrderStatus: IOrderStatusEnum.FAILED,
      description: "Return-to-origin attempt failed.",
    },
    RTO_DELIVERED: {
      pidgeOrderStatus: IOrderStatusEnum.DELIVERED,
      description: "Order returned to origin successfully.",
    },
    LOST: {
      pidgeOrderStatus: IOrderStatusEnum.FAILED,
      description: "Order lost in transit. Terminal failure state.",
    },
    DAMAGED: {
      pidgeOrderStatus: IOrderStatusEnum.FAILED,
      description: "Order damaged in transit. Terminal failure state.",
    },
  };
  