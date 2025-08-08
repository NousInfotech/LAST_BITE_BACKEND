import { IOrder, IOrderFeedback, IOrderFoodItem, IOrderLocation, IOrderPricing, IOrderStatusEnum, IPaymentType } from "../../domain/interfaces/order.interface.js";
import { FoodItemRepository } from "../../infrastructure/repositories/foodItem.repository.js";
import { OrderRepository } from "../../infrastructure/repositories/order.repository.js";
import { RestaurantRepository } from "../../infrastructure/repositories/restaurant.repository.js";
import { MartProductRepository } from "../../infrastructure/repositories/martProduct.repository.js";
import { MartStoreRepository } from "../../infrastructure/repositories/martStore.repository.js";
import { MartStoreAdminRepository } from "../../infrastructure/repositories/martStoreAdmin.repository.js";
import { createRazorpayOrderService, getRazorpayOrderById, verifyOrderService } from "../services/razorpay.service.js";
import { GST } from "../../utils/constants.js";
import { PaymentRepository } from "../../infrastructure/repositories/payment.repository.js";
import { createPidgeOrder, CreatePidgeOrderPayload, getPidgeOrderStatus, getPidgePayload } from "../services/pidge.service.js";
import { UserRepository } from "../../infrastructure/repositories/user.repository.js";
import { RestaurantAdminRepository } from "../../infrastructure/repositories/restaurantAdmin.repository.js";
import { IUser } from "../../domain/interfaces/user.interface.js";
import { IMartStoreAdmin } from "../../domain/interfaces/martStoreAdmin.interface.js";
import { generateOtpForDelivery } from "../../utils/generateOtpForDelivery.js";
import { PidgePackage } from "../../domain/interfaces/pidge.interface.js";
import { config } from "../../config/env.js";

const orderRepo = new OrderRepository();
const restaurantRepo = new RestaurantRepository();
const foodItemRepo = new FoodItemRepository();
const martProductRepo = new MartProductRepository();
const martStoreRepo = new MartStoreRepository();
const martStoreAdminRepo = new MartStoreAdminRepository();
const paymentRepo = new PaymentRepository();
const userRepo = new UserRepository();
const restaurantAdminRepo = new RestaurantAdminRepository();

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

const calculateMartTotalPricing = async (
    itemsTotal: number,
    deliveryFee: number,
    discount: number = 0,
    martStoreId: string
): Promise<IOrderPricing> => {
    // For mart stores, we don't have packaging charges, so we'll use 0
    const packagingFee = 0;

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
        
        console.log('Creating online order with data:', {
            userId,
            restaurantId,
            itemsCount: items.length,
            deliveryFee,
            orderNotes
        });

        // Check if this is a mart store order by trying to find a mart store first
        let isMartStoreOrder = false;
        try {
            const martStore = await martStoreRepo.findByMartStoreId(restaurantId);
            if (martStore) {
                isMartStoreOrder = true;
                console.log('Mart store found:', martStore.martStoreName);
            }
        } catch (error) {
            console.log('Not a mart store, proceeding as restaurant order');
            // Not a mart store, proceed as restaurant order
            isMartStoreOrder = false;
        }

        let itemsTotal: number;
        let enrichedItems: IOrderFoodItem[];

        if (isMartStoreOrder) {
            console.log('Processing mart store order...');
            // Handle mart store order
            const result = await calculateMartItemsTotal(items);
            itemsTotal = result.itemsTotal;
            enrichedItems = result.enrichedItems;
            console.log('Mart store order processed successfully');
        } else {
            console.log('Processing restaurant order...');
            // Handle restaurant order
            const result = await calculateFoodItemsTotal(items);
            itemsTotal = result.itemsTotal;
            enrichedItems = result.enrichedItems;
            console.log('Restaurant order processed successfully');
        }

        console.log('Calculating pricing...');
        let pricing: IOrderPricing;
        if (isMartStoreOrder) {
            pricing = await calculateMartTotalPricing(itemsTotal, data.deliveryFee, 0, restaurantId);
        } else {
            pricing = await calculateTotalPricing(itemsTotal, data.deliveryFee, 0, restaurantId);
        }
        console.log('Pricing calculated:', pricing);

        // FIX: Stringify objects/arrays in notes
        const notes = {
            userId: String(userId),
            restaurantId: String(restaurantId),
            items: JSON.stringify(items),
            location: JSON.stringify(location),
            orderNotes: orderNotes || "",
            deliveryCharges: deliveryFee,
            orderType: isMartStoreOrder ? "mart_store" : "restaurant"
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
        const orderType = notes.orderType as string || "restaurant";

        if (!userId || !restaurantId || !location || !deliveryFee) {
            throw new Error("Essential order info missing in Razorpay notes.");
        }

        // Normalize location format
        const normalizedLocation = normalizeLocation(location);

        // Check if this is a mart store order
        const isMartStoreOrder = orderType === "mart_store";

        // Step 1: Calculate Items Total First
        let itemsTotal: number;
        let enrichedItems: IOrderFoodItem[];
        
        if (isMartStoreOrder) {
            const result = await calculateMartItemsTotal(items);
            itemsTotal = result.itemsTotal;
            enrichedItems = result.enrichedItems;
        } else {
            const result = await calculateFoodItemsTotal(items);
            itemsTotal = result.itemsTotal;
            enrichedItems = result.enrichedItems;
        }

        // Step 2: Calculate Pricing
        let pricing: IOrderPricing;
        if (isMartStoreOrder) {
            pricing = await calculateMartTotalPricing(itemsTotal, deliveryFee, 0, restaurantId);
        } else {
            pricing = await calculateTotalPricing(itemsTotal, deliveryFee, 0, restaurantId);
        }

        // Step 3: Get Pickup Location
        let pickup: { lat: number; lng: number };
        if (isMartStoreOrder) {
            const martPickup = await getMartPickupLocation(restaurantId);
            pickup = { lat: martPickup.lat, lng: martPickup.lng };
        } else {
            const restaurantPickup = await getPickupLocation(restaurantId);
            pickup = { lat: restaurantPickup.lat, lng: restaurantPickup.lng };
        }

        // Step 4: Get User and Restaurant/Mart Store Admin
        const user = await userRepo.findByUserId(userId);
        let restaurantAdmin;
        let martStoreAdmin;
        
        if (isMartStoreOrder) {
            // For mart stores, find the mart store admin
            martStoreAdmin = await martStoreAdminRepo.findByMartStoreAdminByMartStoreId(restaurantId);
            restaurantAdmin = null;
        } else {
            // For restaurants, find the restaurant admin
            restaurantAdmin = await restaurantAdminRepo.findByRestaurantAdminByRestaurantId(restaurantId);
            martStoreAdmin = null;
        }

        if (!user) throw new Error("User not found");

        // Step 5: Create Pidge Order (for both restaurant and mart store orders)
        let pidgeResponse = null;
        let pidgeGetOrder = null;
        
        console.log('🔍 [PIDGE DEBUG] Checking if should create pidge order:', {
            isMartStoreOrder,
            hasRestaurantAdmin: !!restaurantAdmin,
            hasMartStoreAdmin: !!martStoreAdmin,
            restaurantId,
            userId
        });
        
        // Check if current time is within Pidge test account hours (configurable)
        let isWithinPidgeHours = true;
        if (config.pidgeTimeRestriction.enabled) {
            const currentHour = new Date().getHours();
            isWithinPidgeHours = currentHour >= config.pidgeTimeRestriction.startHour && currentHour < config.pidgeTimeRestriction.endHour;
            
            if (!isWithinPidgeHours) {
                console.log(`⚠️ [PIDGE DEBUG] Skipping Pidge order creation - outside test account hours (${config.pidgeTimeRestriction.startHour} AM - ${config.pidgeTimeRestriction.endHour} PM)`);
            }
        } else {
            console.log('🔍 [PIDGE DEBUG] Pidge time restriction disabled - proceeding with order creation');
        }
        
        if (!isWithinPidgeHours) {
            console.log('⚠️ [PIDGE DEBUG] Skipping Pidge order creation - outside test account hours');
        } else if (isMartStoreOrder && martStoreAdmin) {
            // Create Pidge order for mart store
            try {
                console.log('🔍 [PIDGE DEBUG] Getting mart store pickup location...');
                const martPickup = await getMartPickupLocation(restaurantId);
                console.log('🔍 [PIDGE DEBUG] Mart store pickup location:', martPickup);
                
                console.log('🔍 [PIDGE DEBUG] Creating mart store pidge payload...');
                const pidgePayload = getMartStorePidgePayload(martPickup, martStoreAdmin, normalizedLocation, user as IUser, enrichedItems);
                console.log('🔍 [PIDGE DEBUG] Mart store pidge payload created:', JSON.stringify(pidgePayload, null, 2));
                
                console.log('🔍 [PIDGE DEBUG] Attempting to create Mart Store Pidge order...');
                pidgeResponse = await createPidgeOrder(pidgePayload);
                const { pidgeOrderId, sourceOrderId } = pidgeResponse;
                console.log('✅ [PIDGE DEBUG] Mart Store Pidge order created successfully:', { pidgeOrderId, sourceOrderId });
                
                console.log('🔍 [PIDGE DEBUG] Getting mart store pidge order status...');
                pidgeGetOrder = await getPidgeOrderStatus(pidgeOrderId);
                console.log('✅ [PIDGE DEBUG] Mart Store Pidge order status:', pidgeGetOrder);
            } catch (pidgeError: any) {
                console.error('❌ [PIDGE DEBUG] Mart Store Pidge order creation failed:', pidgeError);
                console.error('❌ [PIDGE DEBUG] Error details:', {
                    message: pidgeError.message,
                    stack: pidgeError.stack,
                    response: pidgeError.response?.data
                });
                // Continue without Pidge - order will still be created
                pidgeResponse = null;
                pidgeGetOrder = null;
            }
        } else if (!isMartStoreOrder && restaurantAdmin) {
            // Create Pidge order for restaurant
            try {
                console.log('🔍 [PIDGE DEBUG] Getting restaurant pickup location...');
                const restaurantPickup = await getPickupLocation(restaurantId);
                console.log('🔍 [PIDGE DEBUG] Restaurant pickup location:', restaurantPickup);
                
                console.log('🔍 [PIDGE DEBUG] Creating restaurant pidge payload...');
                const pidgePayload = getPidgePayload(restaurantPickup, restaurantAdmin, normalizedLocation, user as IUser, enrichedItems);
                console.log('🔍 [PIDGE DEBUG] Restaurant pidge payload created:', JSON.stringify(pidgePayload, null, 2));
                
                console.log('🔍 [PIDGE DEBUG] Attempting to create Restaurant Pidge order...');
                pidgeResponse = await createPidgeOrder(pidgePayload);
                const { pidgeOrderId, sourceOrderId } = pidgeResponse;
                console.log('✅ [PIDGE DEBUG] Restaurant Pidge order created successfully:', { pidgeOrderId, sourceOrderId });
                
                console.log('🔍 [PIDGE DEBUG] Getting restaurant pidge order status...');
                pidgeGetOrder = await getPidgeOrderStatus(pidgeOrderId);
                console.log('✅ [PIDGE DEBUG] Restaurant Pidge order status:', pidgeGetOrder);
            } catch (pidgeError: any) {
                console.error('❌ [PIDGE DEBUG] Restaurant Pidge order creation failed:', pidgeError);
                console.error('❌ [PIDGE DEBUG] Error details:', {
                    message: pidgeError.message,
                    stack: pidgeError.stack,
                    response: pidgeError.response?.data
                });
                // Continue without Pidge - order will still be created
                pidgeResponse = null;
                pidgeGetOrder = null;
            }
        } else {
            console.log('🔍 [PIDGE DEBUG] Skipping pidge order creation:', {
                reason: isMartStoreOrder ? 'No mart store admin found' : 'No restaurant admin found',
                isMartStoreOrder,
                hasRestaurantAdmin: !!restaurantAdmin,
                hasMartStoreAdmin: !!martStoreAdmin
            });
        }

        // Step 6: Create Local Order
        const pidgeData = pidgeResponse ? {
            pidgeId: pidgeResponse.pidgeOrderId,
            orderId: pidgeResponse.sourceOrderId,
            billAmount: pidgeGetOrder?.bill_amount || 0,
            status: pidgeGetOrder?.status || "pending",
        } : undefined;
        
        console.log('🔍 [ORDER DEBUG] Creating order with data:', {
            refIds: { userId, restaurantId },
            foodItems: enrichedItems.length,
            pricing,
            delivery: {
                location: { pickup, dropoff: normalizedLocation.dropoff },
                pidge: pidgeData,
            },
            payment: {
                paymentType: IPaymentType.ONLINE,
                paymentId,
            },
            orderStatus: IOrderStatusEnum.CONFIRMED,
            notes: orderNotes,
        });
        
        console.log('🔍 [ORDER DEBUG] Pidge data being saved:', pidgeData);

        const order = await orderRepo.createOrder({
            refIds: { userId, restaurantId },
            foodItems: enrichedItems,
            pricing,
            delivery: {
                location: { pickup, dropoff: normalizedLocation.dropoff },
                pidge: pidgeData,
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

        console.log('✅ [ORDER DEBUG] Order created successfully:', {
            orderId: order.orderId,
            orderStatus: order.orderStatus,
            userId: order.refIds.userId,
            restaurantId: order.refIds.restaurantId,
            hasPidgeData: !!order.delivery?.pidge,
            pidgeData: order.delivery?.pidge
        });

        // Step 7: Record Payment and Link to Order (async)
        void paymentRepo.createPayment({
            razorpay: { orderId, paymentId },
            linkedOrderId: order.orderId,
            paymentStatus: "PAID",
            amount: {
                total: pricing.finalPayable,
                currency: "INR"
            },
            timestamps: {
                createdAt: new Date(),
                paidAt: new Date(),
            },
        });

        return order;
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

    // feedback 

    customerFeedback: async (orderId: string, feedback: IOrderFeedback) => {
        const customer_feedback = await orderRepo.setOrderFeedback(orderId, feedback);
        if (!customer_feedback) throw new Error("Error in updating the feedback");
        return customer_feedback;
    }
};
