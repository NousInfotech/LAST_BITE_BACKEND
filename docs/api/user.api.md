
# 🧾 **User API Documentation**

---

## 👤 User Routes

```ts
// POST /users
// Public Route
{
  name: string;
  phoneNumber: `+91` + 10 digit number;
  email?: string;
  profileImage?: string;
  addresses?: Address[];
}
```

### 🔐 Authenticated Routes (Require JWT)

```ts
// GET /users/me
// Returns the authenticated user info

// PUT /users/me
{
  name?: string;
  email?: string;
  profileImage?: string;
}

// DELETE /users/me
// Deletes the authenticated user
```

---

## 🏠 Address Routes (User)

```ts
// POST /users/me/addresses
{
  latitude: number;
  longitude: number;
  no: string;
  street: string;
  area: string;
  city: string;
  state: string;
  country: string;
  address: string;
  tag?: string;
}
```

```ts
// GET /users/me/addresses
// Returns Address[]

/**
 * PUT /users/me/addresses/:addressId
 * Same body as POST
 */

/**
 * DELETE /users/me/addresses/:addressId
 */
```

---

## ❤️ PATCH `/users/me/favorites`

### ✅ Description:

Add or remove restaurants or food items from a user's **favorites** list.

### 🔐 Authorization:

✅ Required (Bearer Token)

### 📥 Request Body:

```json
{
  "favourites": {
    "restaurants": ["res_abc123", "res_xyz456"],
    "foodItems": ["food_pizza", "food_burger"]
  },
  "action": "ADD"
}
```

### 🧾 Fields:

| Field                      | Type         | Required | Description                  |
| -------------------------- | ------------ | -------- | ---------------------------- |
| `favourites.restaurants` | `string[]` | Optional | Restaurant IDs to add/remove |
| `favourites.foodItems`   | `string[]` | Optional | Food item IDs to add/remove  |
| `action`                 | `string`   | ✅ Yes   | `"ADD"`or `"REMOVE"`     |

> ⚠️ At least one of `restaurants` or `foodItems` must be provided.

### 📤 Response:

```json
{
  "success": true,
  "message": "Favourites updated successfully",
  "data": {
    "favourites": {
      "restaurants": ["res_abc123"],
      "foodItems": ["food_pizza"]
    }
  }
}
```

---

## 🙈 PATCH `/users/me/hidden-restaurants`

### ✅ Description:

Add or remove hidden restaurants from the user's profile. These are hidden from recommendations/feed.

### 🔐 Authorization:

✅ Required (Bearer Token)

### 📥 Request Body:

```json
{
  "hiddenRestaurants": ["res_hidden123", "res_hidden456"],
  "action": "REMOVE"
}
```

### 🧾 Fields:

| Field                 | Type         | Required | Description                   |
| --------------------- | ------------ | -------- | ----------------------------- |
| `hiddenRestaurants` | `string[]` | ✅ Yes   | Restaurant IDs to hide/unhide |
| `action`            | `string`   | ✅ Yes   | `"ADD"`or `"REMOVE"`      |

### 📤 Response:

```json
{
  "success": true,
  "message": "Hidden restaurants updated successfully",
  "data": {
    "hiddenRestaurants": ["res_hidden456"]
  }
}
```

---

## 🛒 Cart Routes (User)

---

### 🔁 PATCH `/users/cart`

### ✅ Description:

Add, update, or remove items in the user's cart.

### 🔐 Authorization:

✅ Required (Bearer Token)

### 📥 Request Body:

```json
[
  {
    "foodItemId": "food_abc123",
    "quantity": 2
  },
  {
    "foodItemId": "food_xyz456",
    "quantity": 0
  }
]
```

### 🧾 Fields:

| Field          | Type       | Required | Description                           |
| -------------- | ---------- | -------- | ------------------------------------- |
| `foodItemId` | `string` | ✅ Yes   | Unique ID of the food item            |
| `quantity`   | `number` | ✅ Yes   | Quantity to set;`0`removes the item |

> 🔄 If the item exists, its quantity is updated.
>
> 🗑️ Quantity of `0` or less removes the item.

### 📤 Response:

```json
{
  "success": true,
  "message": "Cart updated successfully",
  "data": {
    "userCart": [
      {
        "foodItemId": "food_abc123",
        "quantity": 2,
        "createdAt": "2025-07-06T09:23:26.368Z",
        "updatedAt": "2025-07-06T09:31:17.603Z"
      }
    ]
  }
}
```

---

### 📦 GET `/users/cart`

### ✅ Description:

Returns the current items in the user's cart.

### 🔐 Authorization:

✅ Required (Bearer Token)

### 📤 Response:

```json
{
  "success": true,
  "message": "Cart fetched successfully",
  "data": {
    "userCart": [
      {
        "foodItemId": "food_abc123",
        "quantity": 2,
        "createdAt": "2025-07-06T09:23:26.368Z",
        "updatedAt": "2025-07-06T09:31:17.603Z"
      }
    ]
  }
}
```

---

## ❌ Error Responses (Shared)

### 400 — Bad Request

```json
{
  "success": false,
  "message": "Validation failed",
  "error": "Missing or invalid fields"
}
```

### 404 — Not Found

```json
{
  "success": false,
  "message": "User not found",
  "error": "No matching user"
}
```

---

Let me know if you want this as a downloadable Markdown file or OpenAPI (Swagger) spec.
