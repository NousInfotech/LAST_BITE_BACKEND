import { OrderRepository } from "../../infrastructure/repositories/order.repository.js";
import { PaymentRepository } from "../../infrastructure/repositories/payment.repository.js";
import { FoodItemRepository } from "../../infrastructure/repositories/foodItem.repository.js";
import { RestaurantRepository } from "../../infrastructure/repositories/restaurant.repository.js";
import { IUser } from "../../domain/interfaces/user.interface";
import { IOrder, IOrderFoodItem, IOrderPricing, IOrderLocation } from "../../domain/interfaces/order.interface";
import { IPayment } from "../../domain/interfaces/payment.interface";
import { createOrderService } from "../services/razorpay.service.js";
// Removed unused import for getDistance util

const orderRepo = new OrderRepository();
const paymentRepo = new PaymentRepository();
const foodItemRepo = new FoodItemRepository();
const restaurantRepo = new RestaurantRepository();

// Helper: Bulk fetch food items and map to order format
async function getOrderFoodItems(items: { foodItemId: string; quantity: number; additionals?: any[] }[]) {
    const foodItemIds = items.map(i => i.foodItemId);
    const dbItems = await foodItemRepo.bulkGetByFoodItemIds(foodItemIds);
    return dbItems.map(dbItem => {
        const reqItem = items.find(i => i.foodItemId === dbItem.foodItemId);
        if (!reqItem) throw new Error(`Food item not found in request: ${dbItem.foodItemId}`);
        return {
            foodItemId: dbItem.foodItemId || "",
            name: dbItem.name,
            quantity: reqItem.quantity || 1,
            price: dbItem.price,
            additionals: reqItem.additionals || [],
        };
    });
}

// Helper: Calculate pricing
function calculatePricing(foodItems: IOrderFoodItem[], restaurant: any, distance: number): IOrderPricing {
    const itemsTotal = foodItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = Math.ceil(distance) * 15; // 15 rs per km, rounded up
    const platformFee = 10; // Example static
    const tax = Math.round(itemsTotal * 0.05);
    const discount = 0; // Add logic if needed
    const packagingCharges = restaurant.packagingCharges || 0;
    const finalPayable = itemsTotal + deliveryFee + platformFee + tax + packagingCharges - discount;
    return { itemsTotal, deliveryFee, platformFee, tax, discount, finalPayable };
}

// Helper: Calculate distance between two points (Haversine formula)
function getDistance(pickup: { lat: number; lng: number }, dropoff: { lat: number; lng: number }): number {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371; // Radius of Earth in km
    const dLat = toRad(dropoff.lat - pickup.lat);
    const dLng = toRad(dropoff.lng - pickup.lng);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(pickup.lat)) *
        Math.cos(toRad(dropoff.lat)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

// Helper: Get locations and calculate distance
async function getOrderLocation(restaurant: any, userCurrentLocation: { lat: number; lng: number }): Promise<IOrderLocation> {
    const pickup = restaurant.address.location;
    const dropoff = userCurrentLocation;
    const distance = getDistance(pickup, dropoff);
    return { pickup, dropoff, distance };
}

// Main use-case: Create order and payment
async function createOrderWithPayment({
    user,
    items,
    restaurantId,
    paymentType,
    notes,
}: {
    user: { userId: string };
    items: { foodItemId: string; quantity: number; additionals?: any[] }[];
    restaurantId: string;
    paymentType: "ONLINE" | "COD";
    notes?: any;
}) {
    // 1. Fetch restaurant
    const restaurant = await restaurantRepo.findByRestaurantId(restaurantId);
    if (!restaurant) throw new Error("Restaurant not found");

    // 2. Prepare food items
    const foodItems = await getOrderFoodItems(items);

    // 3. Get location and distance
    const userCurrentLocation = notes?.location;
    const location = await getOrderLocation(restaurant, userCurrentLocation);

    // 4. Calculate pricing
    const pricing = calculatePricing(foodItems, restaurant, location.distance || 0);

    // 5. Create payment (Razorpay order)
    let paymentId: string | undefined = undefined;
    let razorpayOrderId: string | undefined = undefined;
    try {
        const razorpayOrder = await createOrderService({
            amount: pricing.finalPayable * 100, // Razorpay expects paise
            currency: "INR",
            receipt: `order_${Date.now()}`,
            notes: { userId: user.userId, restaurantId },
        });
        // Save payment in DB
        const payment = await paymentRepo.createPayment({
            razorpay: {
                orderId: razorpayOrder.id,
                paymentId: "", // Will be filled after payment
            },
            amount: { total: pricing.finalPayable, currency: "INR" },
            method: "RAZORPAY",
            paymentStatus: "PAID", // Or "PENDING" if you want to update later
            timestamps: { createdAt: new Date(), paidAt: undefined, refundedAt: undefined },
        } as IPayment);
        paymentId = payment.paymentId;
        razorpayOrderId = razorpayOrder.id;
    } catch (e) {
        // Payment creation failed, but we still allow order creation
    }

    // 6. Create order
    const order = await orderRepo.createOrder({
        paymentId,
        paymentType,
        userId: user.userId,
        restaurantId,
        foodItems,
        pricing,
        location,
        orderStatus: "CONFIRMED",
    } as IOrder);

    // 7. Return order and razorpay order id
    return { order, razorpayOrderId };
}

export const OrderUseCase = {
    createOrderWithPayment,
};