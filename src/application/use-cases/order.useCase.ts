import { IOrder, IOrderFoodItem, IOrderLocation, IOrderPricing, IOrderStatusEnum, IPaymentType } from "../../domain/interfaces/order.interface.js";
import { FoodItemRepository } from "../../infrastructure/repositories/foodItem.repository.js";
import { OrderRepository } from "../../infrastructure/repositories/order.repository.js";
import { RestaurantRepository } from "../../infrastructure/repositories/restaurant.repository.js";
import { createRazorpayOrderService, getRazorpayOrderById, verifyOrderService } from "../services/razorpay.service.js";
import { GST } from "../../utils/constants.js";
import { PaymentRepository } from "../../infrastructure/repositories/payment.repository.js";

const orderRepo = new OrderRepository();
const restaurantRepo = new RestaurantRepository();
const foodItemRepo = new FoodItemRepository();
const paymentRepo = new PaymentRepository();

type IItem = Omit<IOrderFoodItem, "name" | "price" | "additionals">;

interface CreateOrderParams {
    userId: string;
    restaurantId: string;
    orderNotes?: string;
    location: Omit<IOrderLocation, "distance" | "pickup">;
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
    return { lat, lng }
}

export const OrderUseCase = {
    // Step 1: Frontend hits this to get Razorpay order
    createOnlineOrder: async (data: CreateOrderParams) => {
        const { userId, restaurantId, orderNotes, items, location } = data;

        const { itemsTotal, enrichedItems } = await calculateFoodItemsTotal(items);
        const deliveryFee = 0; // later via Pidge
        const pricing = await calculateTotalPricing(itemsTotal, deliveryFee, 0, restaurantId);

        const notes = {
            userId,
            restaurantId,
            items,
            location,
            orderNotes,
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

    // Step 2: After Razorpay payment success webhook / verify call
    verifyPaymentAndCreateOrder: async ({
        orderId,
        paymentId,
        signature,
    }: {
        orderId: string;
        paymentId: string;
        signature: string;
    }) => {
        // 1. Validate Razorpay Signature
        const isPaymentValid = verifyOrderService({ orderId, paymentId, signature });
        if (!isPaymentValid) throw new Error("Invalid payment signature");

        // 2. Fetch Razorpay order to get the `notes`
        const razorpayOrder = await getRazorpayOrderById(orderId);
        const notes = razorpayOrder.notes;

        if (!notes) throw new Error("Missing order notes from Razorpay");

        // 3. Extract data from notes
        const items = typeof notes.items === "string" ? JSON.parse(notes.items) : [];
        const location = typeof notes.location === "string" ? JSON.parse(notes.location) : null;
        const userId = notes.userId?.toString();
        const restaurantId = notes.restaurantId?.toString();
        const orderNotes = typeof notes.orderNotes === "string" ? notes.orderNotes : "";

        if (!userId || !restaurantId || !location) {
            throw new Error("Essential order info missing in Razorpay notes.");
        }

        // 4. Enrich items + pricing
        const { itemsTotal, enrichedItems } = await calculateFoodItemsTotal(items);
        const deliveryFee = 0;
        const pricing = await calculateTotalPricing(itemsTotal, deliveryFee, 0, restaurantId);
        const restaurantLocation = await restaurantRepo.getRestaurantLocationById(restaurantId as string);

        // 5. Create the order
        const order = await orderRepo.createOrder({
            refIds: { userId, restaurantId },
            foodItems: enrichedItems,
            pricing,
            delivery: { location: { ...location, distance: 10 } },
            payment: {
                paymentType: IPaymentType.ONLINE,
                paymentId,
            },
            orderStatus: IOrderStatusEnum.CONFIRMED,
            notes: orderNotes,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        // 6 & 7. Fire-and-forget the payment-related operations
        void (async () => {
            try {
                await paymentRepo.createPayment({
                    razorpay: {
                        orderId,
                        paymentId,
                    },
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

        return order;
    },



    // COD order flow — no Razorpay
    createCODOrder: async (data: CreateOrderParams) => {
        const { userId, restaurantId, items, location, orderNotes } = data;
        const { itemsTotal, enrichedItems } = await calculateFoodItemsTotal(items);
        const deliveryFee = 0;
        const pricing = await calculateTotalPricing(itemsTotal, deliveryFee, 0, restaurantId);
        const pickupLocation = await getPickupLocation(restaurantId);

        const order = await orderRepo.createOrder({
            refIds: { userId, restaurantId },
            foodItems: enrichedItems,
            pricing,
            delivery: { location: { ...location, pickup: pickupLocation, distance: 10 } },
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
};
