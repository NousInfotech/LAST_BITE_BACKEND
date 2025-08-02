Here’s a structured **API documentation** for your Pidge delivery-related endpoints based on the validation schemas, responses, and internal format you mentioned:

---

# 📦 **Pidge Delivery API Documentation**

All API responses follow this structure:

```ts
{
  success: boolean;
  message: string;
  data: any;
}
```

---

## 🔹 GET `/delivery/quote`

Fetch a quote for delivery based on pickup and drop details.

### ✅ Query Parameters:

None

### 🧾 Request Body (JSON):

```ts
{
  pickup: {
    coordinates: {
      latitude: number;  // Required, between -90 to 90
      longitude: number; // Required, between -180 to 180
    },
    pincode: string;       // Required, min length 4
  },
  drop: [
    {
      ref: string; // Required, unique reference ID for the drop
      location: {
        coordinates: {
          latitude: number;  // Required
          longitude: number; // Required
        },
        pincode: string;       // Required, min length 4
      },
      attributes?: {
        cod_amount: number;         // Optional, min 0
        weight: number;             // Optional, > 0
        volumetric_weight: number;  // Optional, >= 0
      }
    }
  ]
}
```

### 🔄 Response:

```ts
{
  success: true,
  message: "Quote fetched successfully",
  data: {
    distance: [
      {
        ref: string;
        distance: number;
      }
    ],
    items: [
      {
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
      }
    ]
  }
}
```

---

## 🔹 GET `/delivery/:orderId`

Get order status for a specific Pidge delivery.

### 📘 Path Parameter:

* `orderId` – `string` (Required) – The Pidge order ID (e.g., `"1754000237925PEW8OVGI"`)

### 🔄 Response:

```ts
{
  success: true,
  message: "Order fetched successfully",
  data: {
    id: string;
    reference_id: string;
    bill_amount: number;
    cod_amount: number;
    status: string; // e.g., "in_transit", "cancelled"
    created_at: string;
    updated_at: string;
    customer_detail: {
      name: string;
      mobile: string;
    };
    sender_detail: {
      name: string;
      mobile: string;
    };
    poc_detail: {
      name: string;
      mobile: string;
    };
    owner: {
      id: number;
      type: number;
      name: string;
    };
    dd_channel: {
      name: string;
      order_id: string;
      user: {
        id: number;
        type: number;
      };
    };
    notes: [];
    parent_id: number;
  }
}
```

---

## 🔹 GET `/delivery/tracking/:orderId`

Fetch live tracking location and delivery status for a Pidge order.

### 📘 Path Parameter:

* `orderId` – `string` (Required) – The Pidge order ID

### 🔄 Response:

```ts
{
  success: true,
  message: "Tracking fetched successfully",
  data: {
    rider: {
      name: string;
      mobile: string;
    };
    status: string; // "PICKED_UP", "DELIVERED", etc.
    location: {
      latitude: number;
      longitude: number;
    };
  }
}
```

---

## ⚙️ Notes for Frontend

* After creating the Pidge order (via backend), frontend should **store the Pidge Order ID** and:
  * Call `/delivery/tracking/:orderId` for live tracking.
  * Optionally call `/delivery/:orderId` to show full order details.

---

Let me know if you'd like me to convert this into markdown or Swagger/OpenAPI format.
