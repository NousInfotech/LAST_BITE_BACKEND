# Order API

All endpoints require authentication as a user (`authMiddleware(["user"])`).

---

## Create Online Order

**POST** `/order/online`

### Request Body
```
{
  "restaurantId": "string",
  "items": [
    { "foodItemId": "string", "quantity": 1, "additionals": [] }
  ],
  "orderNotes": "string (optional)",
  "location": {
    "pickup": { "lat": 0, "lng": 0 },
    "dropoff": { "lat": 0, "lng": 0 }
  }
}
```
- `userId` is injected from the authenticated user.

### Response
- `201 Created`
- Body:
```
{
  "success": true,
  "message": "Razorpay Order created successfully",
  "data": { ...orderObject }
}
```

---

## Verify Order & Payment

**POST** `/order/verify`

### Request Body
```
{
  "orderId": "string",
  "paymentId": "string",
  "signature": "string"
}
```

### Response
- `201 Created`
- Body:
```
{
  "success": true,
  "message": "Order created successfully",
  "data": { ...orderObject }
}
```

---

## Update Order Status

**PATCH** `/order/status/:orderId`

### Request Body
```
{
  "status": "CONFIRMED" // or any valid IOrderStatusEnum value
}
```

### Response
- `200 OK`
- Body:
```
{
  "success": true,
  "message": "Order status updated",
  "data": { ...updatedOrderObject }
}
```

---

## Notes
- All endpoints require a valid user authentication token.
- `orderObject` and `updatedOrderObject` follow the latest IOrder interface structure.
- Status values must be from the allowed `IOrderStatusEnum`. 