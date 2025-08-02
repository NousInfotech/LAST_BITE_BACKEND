// services/pidge.service.ts

import { pidgeAxios } from "../../config/pidge.config.js";
import { IOrderFoodItem, IOrderLocation } from "../../domain/interfaces/order.interface.js";
import { GetPidgeQuoteInput, PidgeAddress, PidgeContact, PidgeQuoteResponse, PidgeTrackingResponse, PidgeTrip, IPickup, PidgePackage } from "../../domain/interfaces/pidge.interface.js";
import { IRestaurantAdmin } from "../../domain/interfaces/restaurantAdmin.interface.js";
import { IUser } from "../../domain/interfaces/user.interface.js";
import { generateOtpForDelivery } from "../../utils/generateOtpForDelivery.js";


export interface CreatePidgeOrderPayload {
    channel: string; // e.g. "zomato", "swiggy", etc.
    sender_detail: {
        address: PidgeAddress;
        name: string;
        mobile: string;
        email: string;
        otp?: string;
    };
    poc_detail: PidgeContact;
    trips: PidgeTrip[];
}

export const createPidgeOrder = async (
    payload: CreatePidgeOrderPayload
): Promise<{ sourceOrderId: string; pidgeOrderId: string }> => {
    try {
        const res = await pidgeAxios.post("/v1.0/store/channel/vendor/order", payload);
        const data = res.data?.data;

        const sourceOrderId = Object.keys(data)[0]; // e.g., "PP1010"
        const pidgeOrderId = data[sourceOrderId];   // e.g., "cLB7XafUnOyLDnaQAr_mq"

        return { sourceOrderId, pidgeOrderId };
    } catch (error: any) {
        console.error("Failed to create Pidge order:", error?.response?.data || error.message);
        throw error;
    }
};


export const getPidgeQuote = async (
    input: GetPidgeQuoteInput
): Promise<PidgeQuoteResponse> => {
    try {
        const response = await pidgeAxios.post("/v1.0/store/channel/vendor/quote", input);
        return response.data;
    } catch (error: any) {
        console.error("Failed to fetch Pidge quote:", error.response?.data || error.message);
        throw error;
    }
};

export const getPidgeTracking = async (orderId: string): Promise<PidgeTrackingResponse> => {
    try {
        const res = await pidgeAxios.get(`/v1.0/store/channel/vendor/order/${orderId}/fulfillment/tracking`);
        return res.data;
    } catch (error: any) {
        console.error("Failed to fetch rider location:", error?.response?.data || error.message);
        throw error;
    }
};

export const cancelPidgeOrder = async (orderId: string) => {
    try {
        const response = await pidgeAxios.post(`/v1.0/store/channel/vendor/${orderId}/cancel`);
        return response.data;
    } catch (error: any) {
        console.error("Error cancelling Pidge order:", error?.response?.data || error.message);
        throw error;
    }
}

export const getPidgeOrderStatus = async (orderId: string) => {
    try {
        const response = await pidgeAxios.get(`/v1.0/store/channel/vendor/order/${orderId}`);
        return response.data;
    } catch (error: any) {
        console.error("Error fetching Pidge order status:", error?.response?.data || error.message);
        throw error;
    }
}

export const getPidgePayload = (
    pickup: IPickup,
    restaurantAdmin: IRestaurantAdmin,
    location: IOrderLocation,
    user: IUser,
    foodItems: IOrderFoodItem[], // ✅ Add this
): CreatePidgeOrderPayload => {
    const otp = generateOtpForDelivery(4);

    const packages = foodItems.map((item): PidgePackage => ({
        label: item.name,
        quantity: item.quantity,
    }));

    const totalBillAmount = foodItems.reduce((acc, item) => acc + (item.price || 0) * item.quantity, 0);

    return {
        channel: "custom-channel",
        sender_detail: {
            address: {
                address_line_1: pickup.restaurantAddress.no,
                address_line_2: pickup.restaurantAddress.street,
                label: "none",
                city: pickup.restaurantAddress.city,
                state: pickup.restaurantAddress.state,
                country: pickup.restaurantAddress.country,
                pincode: pickup.restaurantAddress.pincode,
                latitude: pickup.lat,
                longitude: pickup.lng,
                instructions_to_reach: "",
            },
            name: restaurantAdmin.email as string,
            mobile: restaurantAdmin.phoneNumber as string,
            email: restaurantAdmin.email as string,
            otp,
        },
        poc_detail: {
            name: "iliyaas",
            mobile: "",
            email: "",
        },
        trips: [
            {
                receiver_detail: {
                    address: {
                        address_line_1: location.dropoff.no,
                        address_line_2: location.dropoff.street,
                        label: "none",
                        city: location.dropoff.city,
                        state: location.dropoff.state,
                        country: location.dropoff.country,
                        pincode: location.dropoff.pincode,
                        latitude: location.dropoff.latitude,
                        longitude: location.dropoff.longitude,
                    },
                    name: user.name,
                    mobile: user.phoneNumber,
                    email: user.email as string,
                    otp,
                },
                packages,
                source_order_id: "",  // Fill this from order.id if available
                reference_id: "",     // Optional: maybe order.paymentId or similar
                cod_amount: 0,
                bill_amount: totalBillAmount,
            },
        ],
    };
};

