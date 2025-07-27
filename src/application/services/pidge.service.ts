// services/pidge.service.ts

import { pidgeAxios } from "../../config/pidge.config.js";
import { GetPidgeQuoteInput, PidgeAddress, PidgeContact, PidgeQuoteResponse, PidgeTrackingResponse, PidgeTrip } from "../../domain/interfaces/pidge.interface.js";

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
): Promise<any> => {
    try {
        const res = await pidgeAxios.post("/v1.0/store/channel/vendor/order", payload);
        return res.data;
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