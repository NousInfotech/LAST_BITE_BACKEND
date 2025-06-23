## 👤 User API

```
// POST /users
// Public Route
{
  name: string;
  phoneNumber: `+91` + 10 digit number;
  email?: string;
  profileImage?: string;
  addresses?: Address[];
}

// GET /users/me
// Authenticated Route
// Returns user based on decoded JWT

// PUT /users/me
// Authenticated Route
{
  name?: string;
  email?: string;
  profileImage?: string;
}

// DELETE /users/me
// Authenticated Route
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

// GET /users/me/addresses
// Returns Address[]

// PUT /users/me/addresses/:addressId
// Same as POST body

// DELETE /users/me/addresses/:addressId
Sure! Here's a clean and concise **API documentation** for your two PATCH routes:

---

## 🔧 PATCH `/user/favorites`

### ✅ Description:

Add or remove restaurants or food items from a user's **favorites** list.

### 🔐 Authorization:

✅ **Required** (Bearer Token) — `req.userId` is expected to be injected by auth middleware.

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

### 🧾 Body Fields:

| Field                    | Type       | Required | Description                                     |
| ------------------------ | ---------- | -------- | ----------------------------------------------- |
| `favourites.restaurants` | `string[]` | Optional | Array of restaurant IDs to add/remove           |
| `favourites.foodItems`   | `string[]` | Optional | Array of food item IDs to add/remove            |
| `action`                 | `string`   | ✅ Yes    | `"ADD"` or `"REMOVE"` to indicate the operation |

> ⚠️ At least one of `restaurants` or `foodItems` must be provided.

### 📤 Response (Success):

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


## 🔧 PATCH `/user/hidden-restaurants`

### ✅ Description:

Add or remove hidden restaurants from the user's profile. These restaurants may be hidden from views like discovery or home feed.

### 🔐 Authorization:

✅ **Required** (Bearer Token)

### 📥 Request Body:

```json
{
  "hiddenRestaurants": ["res_hidden123", "res_hidden456"],
  "action": "REMOVE"
}
```

### 🧾 Body Fields:

| Field               | Type       | Required | Description                   |
| ------------------- | ---------- | -------- | ----------------------------- |
| `hiddenRestaurants` | `string[]` | ✅ Yes    | Restaurant IDs to hide/unhide |
| `action`            | `string`   | ✅ Yes    | `"ADD"` or `"REMOVE"`         |

### 📤 Response (Success):

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

### ❌ Error Responses:

#### 400 — Bad Request

```json
{
  "success": false,
  "message": "Validation failed",
  "error": "hiddenRestaurants must be a non-empty array"
}
```

#### 404 — User not found

```json
{
  "success": false,
  "message": "User not found or update failed",
  "error": "Unknown error"
}

```
