## 📄 `foodItem.api.md`

```md
# 🍱 Food Item API

Base URL: `/api/food-items`

---

## 🔓 PUBLIC ROUTES

### ✅ GET `/`
**Description**: Get all food items.

**Response**
- `200 OK`: List of food items.

---

### ✅ GET `/:foodItemId`
**Description**: Get a food item by its ID.

**Path Parameters**
- `foodItemId` (string)

**Response**
- `200 OK`: Food item object.
- `404 Not Found`: Food item not found.

---

### ✅ GET `/restaurant/:restaurantId`
**Description**: Get all food items from a specific restaurant.

**Path Parameters**
- `restaurantId` (string)

**Response**
- `200 OK`: Array of food items.
- `404 Not Found`: Restaurant not found.

---

## 🔐 PROTECTED ROUTES (restaurantAdmin, superAdmin)

> These routes require authentication and authorized roles.

### ✅ POST `/`
**Description**: Create a new food item.

**Request Body**
```json
{
  "restaurantId": "res_47uMGp0W3z",
  "name": "Paneer Butter Masala",
  "description": "Creamy paneer curry with butter and spices.",
  "price": 250,
  "category": "main_course",
  "isAvailable": true,
  "image": "https://example.com/paneer.jpg",
  "typesOfFood": ["veg", "halal", "organic"]
}
````

**Response**

* `201 Created`: Food item created.
* `404 Not Found`: Invalid or non-existent restaurant ID.

---

### ✅ PUT `/:foodItemId`

**Description**: Update a food item.

**Path Parameters**

* `foodItemId` (string)

**Request Body**: Same as POST (fields optional for partial update).

**Response**

* `200 OK`: Food item updated.
* `404 Not Found`: Food item not found.

---

### ✅ DELETE `/:foodItemId`

**Description**: Delete a food item.

**Path Parameters**

* `foodItemId` (string)

**Response**

* `200 OK`: Food item deleted.
* `404 Not Found`: Food item not found.

```

