import { IOrder, IOrderFeedback, IOrderFoodItem, IOrderLocation, IOrderPricing, IOrderStatusEnum, IPaymentType } from "../../domain/interfaces/order.interface.js";
import { FoodItemRepository } from "../../infrastructure/repositories/foodItem.repository.js";
import { OrderRepository } from "../../infrastructure/repositories/order.repository.js";
import { RestaurantRepository } from "../../infrastructure/repositories/restaurant.repository.js";
import { MartProductRepository } from "../../infrastructure/repositories/martProduct.repository.js";
import { MartStoreRepository } from "../../infrastructure/repositories/martStore.repository.js";
import { MartStoreAdminRepository } from "../../infrastructure/repositories/martStoreAdmin.repository.js";
import { createRazorpayOrderService, getRazorpayOrderById, verifyOrderService } from "../services/razorpay.service.js";
import { GST, platformFee, packagingFee } from "../../utils/constants.js";
import { PaymentRepository } from "../../infrastructure/repositories/payment.repository.js";
import { createPidgeOrder, CreatePidgeOrderPayload, getPidgeOrderStatus, getPidgePayload } from "../services/pidge.service.js";
import { UserRepository } from "../../infrastructure/repositories/user.repository.js";
import { RestaurantAdminRepository } from "../../infrastructure/repositories/restaurantAdmin.repository.js";
import { IUser } from "../../domain/interfaces/user.interface.js";
import { NotificationRepository } from "../../infrastructure/repositories/notification.repository.js";
import { IDiscount } from "../../domain/interfaces/payment.interface.js";
import { IMartStoreAdmin } from "../../domain/interfaces/martStoreAdmin.interface.js";
import { PidgePackage } from "../../domain/interfaces/pidge.interface.js";
import { generateOtpForDelivery } from "../../utils/generateOtpForDelivery.js";
import { startOfWeek, format } from "date-fns";
import { sendUserNotification } from "../../presentation/sockets/userNotification.socket.js";
import { sendRestaurantNotification } from "../../presentation/sockets/restaurantNotification.socket.js";
import { RoleEnum } from "../../domain/interfaces/utils.interface.js";

const orderRepo = new OrderRepository();
const restaurantRepo = new RestaurantRepository();
const foodItemRepo = new FoodItemRepository();
const martProductRepo = new MartProductRepository();
const martStoreRepo = new MartStoreRepository();
const martStoreAdminRepo = new MartStoreAdminRepository();
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
    discount?: IDiscount;
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

const calculateMartItemsTotal = async (
    items: IItem[]
): Promise<{ itemsTotal: number; enrichedItems: IOrderFoodItem[] }> => {
    console.log('Calculating mart items total for items:', items);
    
    const martProductIds = items.map((i) => i.foodItemId);
    console.log('Mart product IDs to fetch:', martProductIds);
    
    const baseItems = await martProductRepo.getMartProductsForOrder(martProductIds);
    console.log('Base items found:', baseItems.length);

    const enrichedItems: IOrderFoodItem[] = items.map((cartItem) => {
        console.log('Processing cart item:', cartItem);
        
        // Try to find by martProductId first, then by _id if martProductId is not set
        const match = baseItems.find((item) => 
            item.martProductId === cartItem.foodItemId || 
            item._id?.toString() === cartItem.foodItemId
        );
        
        if (!match) {
            console.error(`Mart Product ${cartItem.foodItemId} not found in baseItems:`, baseItems.map(item => ({ 
                martProductId: item.martProductId, 
                _id: item._id,
                productName: item.productName 
            })));
            throw new Error(`Mart Product ${cartItem.foodItemId} not found`);
        }
        
        console.log('Found matching product:', {
            martProductId: match.martProductId,
            _id: match._id,
            productName: match.productName,
            price: match.price
        });
        
        const enrichedItem = { 
            foodItemId: match.martProductId || match._id?.toString() || cartItem.foodItemId,
            name: match.productName,
            price: match.price,
            quantity: cartItem.quantity, 
            additionals: [] 
        };
        
        console.log('Created enriched item:', enrichedItem);
        return enrichedItem;
    });

    const itemsTotal = enrichedItems.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
    );
    
    console.log('Calculated items total:', itemsTotal);

    return { itemsTotal, enrichedItems };
};

const calculateTotalPricing = async (
    itemsTotal: number,
    deliveryFee: number,
    discount: IDiscount | null,
    restaurantId: string
): Promise<IOrderPricing> => {
    // Use fixed fees from constants - no longer restaurant-specific
    const tax = Math.round(itemsTotal * GST / 100); // Assuming GST = 5
    const sgst = Math.round(itemsTotal * 0.025);
    const cgst = Math.round(itemsTotal * 0.025);

    // 🔢 Calculate discount amount
    let discountAmount = 0;
    if (discount) {
        if (discount.type === 'FIXED') {
            discountAmount = discount.number;
        } else if (discount.type === 'PERCENTAGE') {
            discountAmount = Math.round(itemsTotal * (discount.number / 100));
        }
    }

    const finalPayable = Math.max(0, Math.round(
        itemsTotal + packagingFee + deliveryFee + platformFee + tax - discountAmount
    ));

    // 💸 Revenue split logic:
    // - Platform gets platformFee + 40% of itemsTotal
    const platformShare = platformFee + Math.round(itemsTotal * 0.4);

    // - Delivery partner gets deliveryFee
    const deliveryPartnerShare = deliveryFee;

    // - Restaurant gets 55% of itemsTotal (no packaging fee for restaurant)
    const restaurantShare = Math.round(itemsTotal * 0.55);

    return {
        itemsTotal,
        packagingFee,
        deliveryFee,
        platformFee,
        tax: {
            total: tax,
            cgst,
            sgst,
        },
        discount: discountAmount > 0 ? discountAmount : undefined,
        finalPayable,
        distribution: {
            platform: platformShare,
            deliveryPartner: deliveryPartnerShare,
            restaurant: restaurantShare,
        },
    };
};

const calculateMartTotalPricing = async (
    itemsTotal: number,
    deliveryFee: number,
    discount: IDiscount | null = null,
    martStoreId: string
): Promise<IOrderPricing> => {
    // For mart stores, use fixed fees from constants
    const tax = Math.round(itemsTotal * GST / 100);
    const sgst = Math.round(itemsTotal * 0.025);
    const cgst = Math.round(itemsTotal * 0.025);

    // Calculate discount amount
    let discountAmount = 0;
    if (discount) {
        if (discount.type === 'FIXED') {
            discountAmount = discount.number;
        } else if (discount.type === 'PERCENTAGE') {
            discountAmount = Math.round(itemsTotal * (discount.number / 100));
        }
    }

    const finalPayable = Math.max(0, Math.round(
        itemsTotal + packagingFee + deliveryFee + platformFee + tax - discountAmount
    ));

    return {
        itemsTotal,
        packagingFee,
        deliveryFee,
        platformFee,
        tax: {
            total: tax,
            cgst,
            sgst,
        },
        discount: discountAmount > 0 ? discountAmount : undefined,
        finalPayable,
        distribution: {
            platform: platformFee + Math.round(itemsTotal * 0.4),
            deliveryPartner: deliveryFee,
            restaurant: Math.round(itemsTotal * 0.55), // No packaging fee for mart store
        },
    };
};

const getPickupLocation = async (
    restaurantId: string
) => {
    const restaurantAddress = await restaurantRepo.getRestaurantLocationById(restaurantId);
    const [lng, lat] = restaurantAddress.location.coordinates;
    return { lat, lng, restaurantAddress }
}

const getMartPickupLocation = async (
    martStoreId: string
) => {
    const martStore = await martStoreRepo.findByMartStoreId(martStoreId);
    if (!martStore) throw new Error(`Mart store ${martStoreId} not found`);
    
    // For now, return a default location for mart stores
    // You can update this when mart stores have location data
    return { 
        lat: 13.0281, 
        lng: 80.2248, 
        martStoreAddress: martStore 
    }
}

const normalizeLocation = (location: any) => {
    // Handle both lat/lng and latitude/longitude formats
    const dropoff = {
        lat: (location.dropoff as any).lat || (location.dropoff as any).latitude,
        lng: (location.dropoff as any).lng || (location.dropoff as any).longitude,
        no: location.dropoff.no || "N/A",
        street: location.dropoff.street || "N/A",
        area: location.dropoff.area || "N/A",
        city: location.dropoff.city || "N/A",
        state: location.dropoff.state || "N/A",
        country: location.dropoff.country || "India",
        pincode: location.dropoff.pincode || "600001",
        address: location.dropoff.address || "N/A",
        tag: location.dropoff.tag || "home",
    };

    return { 
        pickup: { lat: 0, lng: 0 }, // Will be set later
        dropoff 
    };
};

const getMartStorePidgePayload = (
    pickup: { lat: number; lng: number; martStoreAddress: any },
    martStoreAdmin: IMartStoreAdmin,
    location: IOrderLocation,
    user: IUser,
    foodItems: IOrderFoodItem[],
): CreatePidgeOrderPayload => {
    const otp = generateOtpForDelivery(4);

    const packages = foodItems.map((item): PidgePackage => ({
        label: item.name,
        quantity: item.quantity,
    }));

    const totalBillAmount = foodItems.reduce((acc, item) => acc + (item.price || 0) * item.quantity, 0);

    // Handle both lat/lng and latitude/longitude formats
    const dropoffLat = (location.dropoff as any).lat || (location.dropoff as any).latitude;
    const dropoffLng = (location.dropoff as any).lng || (location.dropoff as any).longitude;

    if (!dropoffLat || !dropoffLng) {
        throw new Error("Missing latitude/longitude in dropoff location");
    }

    // Ensure pickup coordinates are available
    if (!pickup.lat || !pickup.lng) {
        throw new Error("Missing pickup coordinates");
    }

    // Validate mart store address data
    const addressLine1 = pickup.martStoreAddress.address?.no || pickup.martStoreAddress.no || pickup.martStoreAddress.street?.split(',')[0] || "N/A";
    const addressLine2 = pickup.martStoreAddress.address?.street || pickup.martStoreAddress.street || pickup.martStoreAddress.area || "N/A";
    const city = pickup.martStoreAddress.address?.city || pickup.martStoreAddress.city || "N/A";
    const state = pickup.martStoreAddress.address?.state || pickup.martStoreAddress.state || "N/A";
    const country = pickup.martStoreAddress.address?.country || pickup.martStoreAddress.country || "India";
    const pincode = pickup.martStoreAddress.address?.pincode || pickup.martStoreAddress.pincode || "600001";

    console.log('🔍 [MART STORE DEBUG] Validated address fields:', {
        addressLine1,
        addressLine2,
        city,
        state,
        country,
        pincode
    });

    console.log('Creating Mart Store Pidge payload with:', {
        pickup: { lat: pickup.lat, lng: pickup.lng },
        dropoff: { lat: dropoffLat, lng: dropoffLng },
        packages: packages.length,
        totalBillAmount,
        martStoreAdmin: martStoreAdmin.name
    });
    
    console.log('🔍 [MART STORE DEBUG] Mart store address data:', {
        martStoreAddress: pickup.martStoreAddress,
        no: pickup.martStoreAddress.address?.no || pickup.martStoreAddress.no,
        street: pickup.martStoreAddress.address?.street || pickup.martStoreAddress.street,
        area: pickup.martStoreAddress.address?.area || pickup.martStoreAddress.area,
        city: pickup.martStoreAddress.address?.city || pickup.martStoreAddress.city,
        state: pickup.martStoreAddress.address?.state || pickup.martStoreAddress.state,
        country: pickup.martStoreAddress.address?.country || pickup.martStoreAddress.country,
        pincode: pickup.martStoreAddress.address?.pincode || pickup.martStoreAddress.pincode
    });

    return {
        channel: "custom-channel",
        sender_detail: {
            address: {
                address_line_1: addressLine1,
                address_line_2: addressLine2,
                label: "none",
                city: city,
                state: state,
                country: country,
                pincode: pincode,
                latitude: pickup.lat,
                longitude: pickup.lng,
                instructions_to_reach: "",
            },
            name: martStoreAdmin.name,
            mobile: martStoreAdmin.phoneNumber,
            email: martStoreAdmin.email || "admin@martstore.com",
            otp,
        },
        poc_detail: {
            name: "iliyaas",
            mobile: martStoreAdmin.phoneNumber,
            email: martStoreAdmin.email || "admin@martstore.com",
        },
        trips: [
            {
                receiver_detail: {
                    address: {
                        address_line_1: location.dropoff.no || "N/A",
                        address_line_2: location.dropoff.street || "N/A",
                        label: "none",
                        city: location.dropoff.city || "N/A",
                        state: location.dropoff.state || "N/A",
                        country: location.dropoff.country || "India",
                        pincode: location.dropoff.pincode || "600001",
                        latitude: dropoffLat,
                        longitude: dropoffLng,
                    },
                    name: user.name,
                    mobile: user.phoneNumber,
                    email: user.email as string,
                    otp,
                },
                packages,
                source_order_id: `mart_order_${Date.now()}`,  // Generate unique mart order ID
                reference_id: `mart_ref_${Date.now()}`,     // Generate unique mart reference ID
                cod_amount: 0,
                bill_amount: totalBillAmount,
            },
        ],
    };
};


export const OrderUseCase = {
    // Step 1: Frontend hits this to get Razorpay order
    createOnlineOrder: async (data: CreateOrderParams) => {
        const { userId, restaurantId, orderNotes, items, location, deliveryFee } = data;

        // Determine if this is a mart store order based on restaurantId format
        const isMartStoreOrder = restaurantId.startsWith('mart_');

        let itemsTotal: number;
        let enrichedItems: IOrderFoodItem[];

        if (isMartStoreOrder) {
            // Handle mart store order
            const result = await calculateMartItemsTotal(items);
            itemsTotal = result.itemsTotal;
            enrichedItems = result.enrichedItems;
        } else {
            // Handle restaurant order
            const result = await calculateFoodItemsTotal(items);
            itemsTotal = result.itemsTotal;
            enrichedItems = result.enrichedItems;
        }

        // Calculate pricing based on order type
        const pricing = isMartStoreOrder 
            ? await calculateMartTotalPricing(itemsTotal, data.deliveryFee, data.discount || null, restaurantId)
            : await calculateTotalPricing(itemsTotal, data.deliveryFee, data.discount || null, restaurantId);

        // FIX: Stringify objects/arrays in notes
        const notes = {
            userId: String(userId),
            restaurantId: String(restaurantId),
            items: JSON.stringify(items),
            location: JSON.stringify(location),
            orderNotes: orderNotes || "",
            deliveryCharges: deliveryFee,
            discount: data.discount ? JSON.stringify(data.discount) : null,
            isMartStoreOrder: isMartStoreOrder,
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

        // Normalize notes fields coming back from Razorpay (may be strings or objects)
        const items = Array.isArray(notes.items)
            ? (notes.items as any)
            : (typeof notes.items === "string" ? JSON.parse(notes.items) : []);
        const location = typeof notes.location === "string"
            ? JSON.parse(notes.location)
            : (notes.location ?? null);
        const userId = notes.userId?.toString();
        const restaurantId = notes.restaurantId?.toString();
        const orderNotes = typeof notes.orderNotes === "string" ? notes.orderNotes : "";
        const deliveryFeeRaw = notes.deliveryCharges;
        const deliveryFee = typeof deliveryFeeRaw === 'string' ? Number(deliveryFeeRaw) : Number(deliveryFeeRaw ?? 0);
        const discount = notes.discount
            ? (typeof notes.discount === "string" ? JSON.parse(notes.discount) : notes.discount)
            : null;
        const isMartStoreOrder = (
            (notes.isMartStoreOrder as any) === true ||
            (notes.isMartStoreOrder as any) === 'true'
        ) || (restaurantId && restaurantId.startsWith('mart_'));

        if (!userId || !restaurantId || !location || deliveryFee === undefined || deliveryFee === null || Number.isNaN(deliveryFee)) {
            throw new Error("Essential order info missing in Razorpay notes.");
        }

        // Normalize location format
        const normalizedLocation = normalizeLocation(location);

        // Calculate items total based on order type
        let itemsTotal: number;
        let enrichedItems: IOrderFoodItem[];

        if (isMartStoreOrder) {
            // Handle mart store order
            const result = await calculateMartItemsTotal(items);
            itemsTotal = result.itemsTotal;
            enrichedItems = result.enrichedItems;
        } else {
            // Handle restaurant order
            const result = await calculateFoodItemsTotal(items);
            itemsTotal = result.itemsTotal;
            enrichedItems = result.enrichedItems;
        }

        // Calculate pricing based on order type
        const pricing = isMartStoreOrder 
            ? await calculateMartTotalPricing(itemsTotal, deliveryFee, discount, restaurantId)
            : await calculateTotalPricing(itemsTotal, deliveryFee, discount, restaurantId);

        // Get pickup location and admin based on order type
        let pickup: any;
        let admin: any;

        if (isMartStoreOrder) {
            [pickup, admin] = await Promise.all([
                getMartPickupLocation(restaurantId),
                martStoreAdminRepo.findByMartStoreAdminByMartStoreId(restaurantId),
            ]);
        } else {
            [pickup, admin] = await Promise.all([
                getPickupLocation(restaurantId),
                restaurantAdminRepo.findByRestaurantAdminByRestaurantId(restaurantId),
            ]);
        }

        const user = await userRepo.findByUserId(userId);

        if (!admin || !user) throw new Error("User or Admin not found");

        // Step 4: Create Pidge Order (with error handling)
        let pidgeOrderId: string | null = null;
        let sourceOrderId: string | null = null;
        let pidgeStatus: "cancelled" | "pending" | "fulfilled" | "completed" = "pending";

        try {
            console.log('🔍 [ORDER USE CASE] Starting Pidge order creation...');
            console.log('🔍 [ORDER USE CASE] Order type:', isMartStoreOrder ? 'Mart Store' : 'Restaurant');
            console.log('🔍 [ORDER USE CASE] Pickup location:', pickup);
            console.log('🔍 [ORDER USE CASE] Admin details:', { 
                id: admin?.restaurantAdminId || admin?.martStoreAdminId,
                email: admin?.email,
                phone: admin?.phoneNumber 
            });
            console.log('🔍 [ORDER USE CASE] User details:', { 
                id: user?.userId,
                name: user?.name,
                phone: user?.phoneNumber 
            });
            console.log('🔍 [ORDER USE CASE] Location:', location);
            console.log('🔍 [ORDER USE CASE] Food items count:', enrichedItems.length);

            const pidgePayload = isMartStoreOrder 
                ? getMartStorePidgePayload(pickup, admin, location, user as IUser, enrichedItems)
                : getPidgePayload(pickup, admin, location, user as IUser, enrichedItems);
            
            console.log('🔍 [ORDER USE CASE] Pidge payload created:', JSON.stringify(pidgePayload, null, 2));
            
            const pidgeResponse = await createPidgeOrder(pidgePayload);
            pidgeOrderId = pidgeResponse.pidgeOrderId;
            sourceOrderId = pidgeResponse.sourceOrderId;
            
            console.log('✅ [ORDER USE CASE] Pidge order created successfully:', { pidgeOrderId, sourceOrderId });
            
            // Get Pidge order status
            try {
                const pidgeGetOrder = await getPidgeOrderStatus(pidgeOrderId);
                const statusFromPidge = pidgeGetOrder?.status;
                if (statusFromPidge && ["cancelled", "pending", "fulfilled", "completed"].includes(statusFromPidge)) {
                    pidgeStatus = statusFromPidge as "cancelled" | "pending" | "fulfilled" | "completed";
                } else {
                    pidgeStatus = "pending";
                }
                console.log('✅ [ORDER USE CASE] Pidge order status retrieved:', pidgeStatus);
            } catch (statusError) {
                console.error("❌ [ORDER USE CASE] Failed to get Pidge order status:", statusError);
                pidgeStatus = "pending";
            }
            
            console.log('✅ [ORDER USE CASE] Pidge integration completed successfully:', { pidgeOrderId, sourceOrderId, pidgeStatus });
        } catch (pidgeError: any) {
            console.error("❌ [ORDER USE CASE] Failed to create Pidge order:", pidgeError);
            console.error("❌ [ORDER USE CASE] Pidge error details:", {
                message: pidgeError?.message || 'Unknown error',
                response: pidgeError?.response?.data || 'No response data',
                status: pidgeError?.response?.status || 'No status'
            });
            // Continue with order creation even if Pidge fails
            // The order will be created without Pidge integration
            console.log("⚠️ [ORDER USE CASE] Continuing with order creation without Pidge integration");
        }

        // Step 5: Create Local Order
        const order = await orderRepo.createOrder({
            refIds: { userId, restaurantId },
            foodItems: enrichedItems,
            pricing,
            delivery: {
                location: { pickup, dropoff: normalizedLocation.dropoff },
                pidge: pidgeOrderId ? {
                    pidgeId: pidgeOrderId,
                    orderId: sourceOrderId || "",
                    billAmount: pricing.finalPayable,
                    status: pidgeStatus
                } : undefined,
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
                    breakdown: {
                        foodItemTotal: pricing.itemsTotal,
                        packagingFee: pricing.packagingFee,
                        platformFee: pricing.platformFee,
                        deliveryFee: pricing.deliveryFee,
                        discount: pricing.discount,
                        tax: {
                            stateGST: pricing.tax.sgst,
                            centralGST: pricing.tax.cgst,
                            total: pricing.tax.total,
                        },
                    },
                    distribution: pricing.distribution,
                    timestamps: {
                        createdAt: new Date(),
                        paidAt: new Date(),
                    },
                    ref: {
                        restaurantId,
                        userId,
                    },
                    settlement: {
                        weekKey: format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-'W'II"),
                        status: 'PENDING',
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
        const { userId, restaurantId, items, location, orderNotes, discount } = data;
        const { itemsTotal, enrichedItems } = await calculateFoodItemsTotal(items);

        // Set distance and delivery fee to 0
        const pickupLocation = await getPickupLocation(restaurantId);
        const distance = 0; // Set distance to 0
        const deliveryFee = 0; // Set delivery fee to 0

        const pricing = await calculateTotalPricing(itemsTotal, deliveryFee, discount || null, restaurantId);

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
        // Notify both parties about status updates
        try {
            const userId = updatedOrder.refIds.userId;
            const restaurantId = updatedOrder.refIds.restaurantId;
            
            if (userId) {
                sendUserNotification(userId, {
                    type: 'order',
                    targetRole: 'user',
                    targetRoleId: userId,
                    message: `Order ${status.toLowerCase()}`,
                    emoji: '🔔',
                    theme: 'info',
                    metadata: { orderId: updatedOrder.orderId, status }
                } as any);
            }
            
            if (restaurantId) {
                sendRestaurantNotification(restaurantId, {
                    type: 'order',
                    targetRole: 'restaurantAdmin',
                    targetRoleId: restaurantId,
                    message: `Order ${status.toLowerCase()}`,
                    emoji: '🔔',
                    theme: 'info',
                    metadata: { orderId: updatedOrder.orderId, status }
                } as any);
            }
        } catch {}
        return updatedOrder;
    },

    // Get all orders for a user
    getUserOrders: async (userId: string) => {
        console.log('Fetching orders for userId:', userId);
        const orders = await orderRepo.getOrders({ "refIds.userId": userId });
        console.log('Found orders:', orders.length);
        console.log('Orders details:', orders.map(o => ({
            orderId: o.orderId,
            orderStatus: o.orderStatus,
            userId: o.refIds?.userId,
            restaurantId: o.refIds?.restaurantId
        })));
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

    // Get all orders for a restaurant
    getRestaurantOrders: async (restaurantId: string) => {
        console.log('Fetching orders for restaurantId:', restaurantId);
        const orders = await orderRepo.getOrdersByRestaurantId(restaurantId);
        console.log('Found orders for restaurant:', orders.length);
        console.log('Orders details:', orders.map(o => ({
            orderId: o.orderId,
            orderStatus: o.orderStatus,
            userId: o.refIds?.userId,
            restaurantId: o.refIds?.restaurantId
        })));
        return orders;
    },

    // Get order by ID
    getOrderById: async (orderId: string) => {
        const order = await orderRepo.getOrderById(orderId);
        if (!order) throw new Error("Order not found");
        return order;
    },

    // feedback 

    customerFeedback: async (orderId: string, feedback: IOrderFeedback) => {
        const customer_feedback = await orderRepo.setOrderFeedback(orderId, feedback);
        if (!customer_feedback) throw new Error("Error in updating the feedback");
        return customer_feedback;
    }
};
