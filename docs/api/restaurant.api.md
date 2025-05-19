

## 🍽️ **Restaurant API**

**Base URL:** `/api/restaurants`

---

### 🔓 Public Routes

#### **GET /** — Get all restaurants

Returns a list of all available restaurants in the system.

---

### 🔐 Protected Routes (`restaurantAdmin`)

#### **GET /\:restaurantId** — Get a single restaurant by its ID

**Path Parameter:**

* `restaurantId`: Custom restaurant identifier (e.g., `res_47uMGp0W3z`)

Returns the complete details of a specific restaurant.

#### **POST /** — Create a new restaurant

Requires restaurant details including address, document info, and operational timings.
**Authorization required.**

#### **PUT /\:restaurantId** — Update a restaurant

Updates existing restaurant data by ID. Only allowed by the owner/admin of the restaurant.

#### **DELETE /\:restaurantId** — Delete a restaurant

Removes a restaurant and its associated data. Admin-only operation.

