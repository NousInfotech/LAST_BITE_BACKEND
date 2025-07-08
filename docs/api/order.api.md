# Order API Documentation

## Authentication
All endpoints require a valid Bearer token (user role) in the `Authorization` header.

---

## 1. Create Razorpay Order

**POST** `/payment/create`

Creates a Razorpay order for online payment. Returns a Razorpay order ID to the frontend. No app order is created yet.

### Request Headers
- `Authorization: Bearer <token>`

### Request Body
```json
{
  "items": [
    { "foodItemId": "string", "quantity": number, "additionals": [ ... ] }
  ],
  "restaurantId": "string",
  "notes": {
    "location": { "lat": number, "lng": number }
  },
  "paymentType": "ONLINE"
}
```

### Response
- **201 Created**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Razorpay order created",
  "data": {
    "razorpayOrderId": "string"
  }
}
```

---

## 2. Verify Razorpay Payment & Create Order

**POST** `/payment/verify`

Verifies the Razorpay payment signature. If valid, creates the app order and payment.

### Request Headers
- `Authorization: Bearer <token>`

### Request Body
```json
{
  "orderId": "string",           // Razorpay order ID
  "paymentId": "string",         // Razorpay payment ID
  "signature": "string",         // Razorpay signature
  "notes": {                      // Original order data (same as /payment/create)
    "items": [ ... ],
    "restaurantId": "string",
    "notes": { "location": { "lat": number, "lng": number } },
    "paymentType": "ONLINE"
  }
}
```

### Response
- **200 OK**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Payment verified and order created",
  "data": {
    "order": { ... },
    "razorpayOrderId": "string"
  }
}
```

---

## 3. Create COD Order

**POST** `/create`

Directly creates an order for Cash on Delivery (COD).

### Request Headers
- `Authorization: Bearer <token>`

### Request Body
```json
{
  "items": [
    { "foodItemId": "string", "quantity": number }
  ],
  "restaurantId": "string",
  "paymentType": "COD",
  "notes": {
    "location": { "lat": number, "lng": number }
  }
}
```

### Response
- **201 Created**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Order created successfully (COD)",
  "data": {
    "order": { ... }
  }
}
```

---

## Error Responses
All endpoints return standardized error responses:
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error message",
  "error": "Error details"
}
``` 