---

## 🍱 **Food Item API**

**Base URL:** `/api/food-items`

---

### 🔓 Public Routes

#### **GET /** — Get all food items

Fetches the complete list of food items from all restaurants.

#### **GET /\:foodItemId** — Get a food item by ID

Returns details of a single food item by its unique identifier.

#### **GET /restaurant/\:restaurantId** — Get food items for a restaurant

**Path Parameter:**

* `restaurantId`: Restaurant’s custom identifier

Returns all food items belonging to the specified restaurant.

---

### 🔐 Protected Routes (`restaurantAdmin`, `superAdmin`)

#### **POST /** — Create a food item

Requires:

* `restaurantId`
* `name`
* `description`
* `price`
* `category`
* `typesOfFood` (e.g., veg, halal, organic)
* `image` (URL)

Validates if the `restaurantId` exists before creation.

#### **PUT /\:foodItemId** — Update a food item

Updates the fields of an existing food item. Only editable by restaurant owner or super admin.

#### **DELETE /\:foodItemId** — Delete a food item

Deletes a food item by ID. Requires proper permissions.

---

## ✅ Authentication & Authorization

* **Protected routes** use a middleware that validates JWT and user roles.
* Only `restaurantAdmin` and `superAdmin` can create/update/delete resources.
* Public routes are accessible without authentication.

---

## 🏷️ Food Types Reference

Used in `typesOfFood` array:

* `veg`
* `non_veg`
* `halal`
* `vegan`
* `kosher`
* `gluten_free`
* `jain`
* `eggetarian`
* `seafood`
* `organic`

