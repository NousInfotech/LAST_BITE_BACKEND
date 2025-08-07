import { IOrder, IOrderFeedback, IOrderFoodItem, IOrderLocation, IOrderPricing, IOrderStatusEnum, IPaymentType } from "../../domain/interfaces/order.interface.js";
import { FoodItemRepository } from "../../infrastructure/repositories/foodItem.repository.js";
import { OrderRepository } from "../../infrastructure/repositories/order.repository.js";
import { RestaurantRepository } from "../../infrastructure/repositories/restaurant.repository.js";
import { createRazorpayOrderService, getRazorpayOrderById, verifyOrderService } from "../services/razorpay.service.js";
import { GST } from "../../utils/constants.js";
import { PaymentRepository } from "../../infrastructure/repositories/payment.repository.js";
import { createPidgeOrder, CreatePidgeOrderPayload, getPidgeOrderStatus, getPidgePayload } from "../services/pidge.service.js";
import { UserRepository } from "../../infrastructure/repositories/user.repository.js";
import { RestaurantAdminRepository } from "../../infrastructure/repositories/restaurantAdmin.repository.js";
import { IUser } from "../../domain/interfaces/user.interface.js";
import { NotificationRepository } from "../../infrastructure/repositories/notification.repository.js";
import { sendUserNotification } from "../../presentation/sockets/userNotification.socket.js";
import { RoleEnum } from "../../domain/interfaces/utils.interface.js";
import { sendRestaurantNotification } from "../../presentation/sockets/restaurantNotification.socket.js";

const orderRepo = new OrderRepository();
const restaurantRepo = new RestaurantRepository();
const foodItemRepo = new FoodItemRepository();
const paymentRepo = new PaymentRepository();
const userRepo = new UserRepository();
const restaurantAdminRepo = new RestaurantAdminRepository();
const notificationRepo = new NotificationRepository();

type IItem = Omit<IOrderFoodItem, "name" | "price" | "additionals">;

interface CreateOrderParams {
    userId: string;
    restaurantId: string;
    orderNotes?: string;
    location: Omit<IOrderLocation, "distance" | "pickup">;
    deliveryFee: number;
    items: IItem[];
}

const calculateFoodItemsTotal = async (
    items: IItem[]
): Promise<{ itemsTotal: number; enrichedItems: IOrderFoodItem[] }> => {
    const foodItemIds = items.map((i) => i.foodItemId);
    const baseItems = await foodItemRepo.getFoodItemsForOrder(foodItemIds);

    const enrichedItems: IOrderFoodItem[] = items.map((cartItem) => {
        const match = baseItems.find((item) => item.foodItemId === cartItem.foodItemId);
        if (!match) throw new Error(`Item ${cartItem.foodItemId} not found`);
        return { ...match, quantity: cartItem.quantity, additionals: [] };
    });

    const itemsTotal = enrichedItems.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
    );

    return { itemsTotal, enrichedItems };
};

const calculateTotalPricing = async (
    itemsTotal: number,
    deliveryFee: number,
    discount: number = 0,
    restaurantId: string
): Promise<IOrderPricing> => {
    let packagingFee = await restaurantRepo.getPackagingChargesByRestaurantId(restaurantId);
    packagingFee = packagingFee ?? 0;

    const platformFee = 10;
    const tax = Math.round(itemsTotal * GST / 100);

    const finalPayable =
        itemsTotal + packagingFee + deliveryFee + platformFee + tax - discount;

    return {
        itemsTotal,
        packagingFee,
        deliveryFee,
        platformFee,
        tax,
        discount: discount > 0 ? discount : undefined,
        finalPayable: Math.round(finalPayable),
    };
};

const getPickupLocation = async (
    restaurantId: string
) => {
    const restaurantAddress = await restaurantRepo.getRestaurantLocationById(restaurantId);
    const [lng, lat] = restaurantAddress.location.coordinates;
    return { lat, lng, restaurantAddress }
}


export const OrderUseCase = {
    // Step 1: Frontend hits this to get Razorpay order
    createOnlineOrder: async (data: CreateOrderParams) => {
        const { userId, restaurantId, orderNotes, items, location, deliveryFee } = data;

        const { itemsTotal, enrichedItems } = await calculateFoodItemsTotal(items);

        const pricing = await calculateTotalPricing(itemsTotal, data.deliveryFee, 0, restaurantId);

        // FIX: Stringify objects/arrays in notes
        const notes = {
            userId: String(userId),
            restaurantId: String(restaurantId),
            items: JSON.stringify(items),
            location: JSON.stringify(location),
            orderNotes: orderNotes || "",
            deliveryCharges: deliveryFee,
        };

        const razorpayOrder = await createRazorpayOrderService({
            amount: pricing.finalPayable * 100, // in paisa
            receipt: `order_${Date.now()}`,
            notes,
        });

        return {
            razorpayOrder,
            pricing,
        };
    },

    verifyPaymentAndCreateOrder: async ({
        orderId,
        paymentId,
        signature,
    }: {
        orderId: string;
        paymentId: string;
        signature: string;
    }) => {
        // Step 1: Validate Razorpay Signature
        const isPaymentValid = verifyOrderService({ orderId, paymentId, signature });
        if (!isPaymentValid) throw new Error("Invalid payment signature");

        // Step 2: Fetch Razorpay Order Notes
        const razorpayOrder = await getRazorpayOrderById(orderId);
        const notes = razorpayOrder.notes;
        if (!notes) throw new Error("Missing order notes from Razorpay");

        const items = typeof notes.items === "string" ? JSON.parse(notes.items) : [];
        const location = typeof notes.location === "string" ? JSON.parse(notes.location) : null;
        const userId = notes.userId?.toString();
        const restaurantId = notes.restaurantId?.toString();
        const orderNotes = typeof notes.orderNotes === "string" ? notes.orderNotes : "";
        const deliveryFee = notes.deliveryCharges as number;

        if (!userId || !restaurantId || !location || !deliveryFee) {
            throw new Error("Essential order info missing in Razorpay notes.");
        }

        // Step 1: Calculate Items Total First
        const { itemsTotal, enrichedItems } = await calculateFoodItemsTotal(items);

        // Step 2: Parallelize the rest with itemsTotal available
        const [pickup, pricing, restaurantAdmin, user] = await Promise.all([
            getPickupLocation(restaurantId),
            calculateTotalPricing(itemsTotal, deliveryFee, 0, restaurantId),
            restaurantAdminRepo.findByRestaurantAdminByRestaurantId(restaurantId),
            userRepo.findByUserId(userId),
        ]);


        if (!restaurantAdmin || !user) throw new Error("User or RestaurantAdmin not found");

        // Step 4: Create Pidge Order
        const pidgePayload = getPidgePayload(pickup, restaurantAdmin, location, user as IUser, enrichedItems);
        const pidgeResponse = await createPidgeOrder(pidgePayload);
        const { pidgeOrderId, sourceOrderId } = pidgeResponse;
        const pidgeGetOrder = await getPidgeOrderStatus(pidgeOrderId);

        // Step 5: Create Local Order
        const order = await orderRepo.createOrder({
            refIds: { userId, restaurantId },
            foodItems: enrichedItems,
            pricing,
            delivery: {
                location: { pickup, dropoff: location.dropoff },
                pidge: {
                    pidgeId: pidgeOrderId,
                    orderId: sourceOrderId,
                    billAmount: pidgeGetOrder.bill_amount,
                    status: pidgeGetOrder.status,
                },
            },
            payment: {
                paymentType: IPaymentType.ONLINE,
                paymentId,
            },
            orderStatus: IOrderStatusEnum.CONFIRMED,
            notes: orderNotes,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        // Step 6 & 7: Record Payment and Link to Order (async)
        void (async () => {
            try {
                await paymentRepo.createPayment({
                    razorpay: { orderId, paymentId },
                    linkedOrderId: order.orderId!,
                    paymentStatus: "PAID",
                    amount: {
                        total: Number(razorpayOrder.amount),
                        currency: "INR",
                    },
                    timestamps: {
                        createdAt: new Date(),
                        paidAt: new Date(),
                    },
                });
            } catch (err) {
                console.error("Failed to create payment record:", err);
            }

            try {
                await orderRepo.updatePaymentId(order.orderId!, paymentId);
            } catch (err) {
                console.error("Failed to update paymentId in order:", err);
            }
        })();

        // Step 8: Notify User
        await notificationRepo.createNotification({
            targetRole: RoleEnum.user,
            targetRoleId: userId,
            type: "order",
            theme: "success",
            message: `Order ${order.orderId} placed successfully.`,
            metadata: {
                orderId
            },
            createdAt: new Date(),
        });

        sendUserNotification(userId, {
            type: "order",
            message: `Your order ${order.orderId} has been placed successfully.`,
        });

        // Step 9: Notify Restaurant
        await notificationRepo.createNotification({
            targetRole: RoleEnum.restaurantAdmin,
            targetRoleId: restaurantId,
            type: "order",
            message: `You have a new order ${order.orderId} from ${user.name}`,
            theme: "success",
            tags: ["order"],
            metadata: {
                orderId,
            },
            createdAt: new Date(),
        });

        sendRestaurantNotification(restaurantId, {
            type: "ORDER_RECEIVED",
            message: `New order from ${user.name} (${order.orderId})`,
        });
        
        return { order, pidgeOrderId };
    },



    // COD order flow — no Razorpay
    createCODOrder: async (data: CreateOrderParams) => {
        const { userId, restaurantId, items, location, orderNotes } = data;
        const { itemsTotal, enrichedItems } = await calculateFoodItemsTotal(items);

        // Set distance and delivery fee to 0
        const pickupLocation = await getPickupLocation(restaurantId);
        const distance = 0; // Set distance to 0
        const deliveryFee = 0; // Set delivery fee to 0

        const pricing = await calculateTotalPricing(itemsTotal, deliveryFee, 0, restaurantId);

        const order = await orderRepo.createOrder({
            refIds: { userId, restaurantId },
            foodItems: enrichedItems,
            pricing,
            delivery: { location: { ...location, pickup: pickupLocation, distance: distance } },
            payment: { paymentType: IPaymentType.COD },
            orderStatus: IOrderStatusEnum.PENDING, // COD might be confirmed at dispatch
            notes: orderNotes ?? "",
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return order;
    },

    // Update status (used by pidge or admin)
    updateOrderStatus: async (orderId: string, status: IOrder["orderStatus"]) => {
        const updatedOrder = await orderRepo.updateOrderStatus(orderId, status);
        if (!updatedOrder) throw new Error("Order not found or status not updated");
        return updatedOrder;
    },

    // Get all orders for a user
    getUserOrders: async (userId: string) => {
        const orders = await orderRepo.getOrders({ "refIds.userId": userId });
        return orders;
    },

    // Get all past orders for a user (DELIVERED or CANCELLED)
    getUserPastOrders: async (userId: string) => {
        const orders = await orderRepo.getOrders({
            "refIds.userId": userId,
            orderStatus: { $in: ["DELIVERED", "CANCELLED"] }
        });
        return orders;
    },
    // feedback 

    customerFeedback: async (orderId: string, feedback: IOrderFeedback) => {
        const customer_feedback = await orderRepo.setOrderFeedback(orderId, feedback);
        if (!customer_feedback) throw new Error("Error in updating the feedback");
        return customer_feedback;
    }
};
