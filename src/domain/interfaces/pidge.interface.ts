export interface PidgeAddress {
    address_line_1: string;
    address_line_2?: string;
    label?: string;
    landmark?: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    latitude: number;
    longitude: number;
    instructions_to_reach?: string;
}

export interface PidgeContact {
    name: string;
    mobile: string;
    email: string;
    otp?: string;
}

interface PidgePointOfContact {
    name: string;
    mobile: string;
    email: string;
}

export interface PidgeProduct {
    name: string;
    sku: string;
    price: number;
    quantity?: number;
    dimension?: {
        dead_weight?: number;
    };
    image_url?: string;
}

export interface PidgePackage {
    label: string;
    quantity: number;
}

export interface PidgeTrip {
    receiver_detail: {
        address: PidgeAddress;
        name: string;
        mobile: string;
        email: string;
        otp?: string;
    };
    packages: PidgePackage[];
    source_order_id: string;
    reference_id: string;
    cod_amount: number;
    bill_amount: number;
    max_cost?: number;
    products?: PidgeProduct[];
    notes?: { name: string; value: string; }[];
    delivery_date?: string; // e.g. "2025-07-25"
    delivery_slot?: string; // e.g. "14:00-15:00"
    instruction_to_reach?: string;
}
export interface PidgeCoordinates {
    latitude: number;
    longitude: number;
}

export interface GetPidgeQuoteInput {
    pickup: {
        coordinates: PidgeCoordinates;
        pincode: string;
    };
    drop: {
        ref: string; // e.g. order ID or custom identifier
        location: {
            coordinates: PidgeCoordinates;
            pincode: string;
        };
        attributes?: {
            cod_amount: number;
            weight: number;
            volumetric_weight: number;
        };
    }[];
}

export interface IPickup {
    lat: number;
    lng: number;
    restaurantAddress: {
        no: string;
        street: string;
        city: string;
        state: string;
        country: string;
        pincode: string;
    };
}


export interface CreatePidgeOrderPayload {
    channel: string;
    sender_detail: PidgeContact;
    poc_detail: PidgePointOfContact;
    trips: PidgeTrip[];
}


export interface PidgeQuoteResponse {
    data: {
        distance: {
            ref: string;
            distance: number;
        }[];
        items: {
            network_id: string;
            network_name: string;
            service: string;
            pickup_now: boolean;
            quote: {
                price: number;
                distance?: number | null;
                eta?: {
                    pickup?: string | null;
                    pickup_min?: number | null;
                    drop?: string | null;
                    drop_min?: number | null;
                };
                price_breakup: {
                    base_delivery_charge: number;
                    total_gst_amount: number;
                    surge: number;
                    additional_charges?: any[];
                    items?: {
                        amount: number;
                        tax: number;
                        total: number;
                        order_id: string;
                    }[];
                };
            };
            error: any;
        }[];
    };
}
// services/pidge.service.ts

export interface PidgeTrackingResponse {
    data: {
        rider: {
            name: string;
            mobile: string;
        };
        status: string; // e.g. "PICKED_UP", "DELIVERED", etc.
        location: {
            latitude: number;
            longitude: number;
        };
    } | null;
}

