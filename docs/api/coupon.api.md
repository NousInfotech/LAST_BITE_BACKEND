🛠 **Coupon API**

**Base URL:** `/coupons`

---

### 🔓 Public Routes

#### **GET /** — Get all coupons

Fetches the complete list of coupons.

Supports optional query filters such as `type`, `isActive`, `code`, `limit`, `startDate`, `endDate`, etc.

---

#### **GET /code/:code** — Get coupon by code

**Path Parameter:**

* `code` — Coupon code (case-insensitive; matched against stored uppercase codes).

Returns coupon details matching the given code.

---

#### **GET /bulk** — Bulk fetch coupons by IDs

**Request Body:**

```json
{
  "couponIds": ["cou_123", "cou_456"]
}
```

Returns details for multiple coupons in a single request.

---

#### **GET /:couponId** — Get coupon by ID

**Path Parameter:**

* `couponId` — Unique identifier of the coupon.

Returns details of a single coupon by its unique identifier.

---

### 🔐 Protected Routes (`superAdmin`)

#### **POST /** — Create a coupon

**Request Body:**

* `title` — Coupon name (string, required)
* `code` — Coupon code (string, required; automatically stored uppercase)
* `type` — `"PERCENTAGE"` or `"FIXED"` (string, required)
* `discountValue` — Discount amount/percentage (number, required)
* `limit` — Max total redemptions (`number` or `"unlimited"`, required)
* `description` — *(optional)* Description or usage notes
* `minOrderValue` — *(optional)* Minimum order value to apply (number)
* `startDate` — *(optional)* Coupon activation date (Date)
* `endDate` — *(optional)* Coupon expiry date (Date)
* `isActive` — *(optional)* Whether coupon is active (boolean, default: false)
* `count` — *(optional)* Current redemption count (number, default: 0)

Creates a new coupon entry in the system.

---

#### **PUT /:couponId** — Update a coupon

**Path Parameter:**

* `couponId` — Unique identifier of the coupon.

**Request Body:**

Any updatable fields (`title`, `description`, `code`, `type`, `discountValue`, `limit`, `minOrderValue`, `startDate`, `endDate`, `isActive`).

---

#### **DELETE /:couponId** — Delete a coupon

Deletes the coupon with the given ID.

---

## ✅ Authentication & Authorization

* **Protected routes** require JWT authentication and the `superAdmin` role.
* Public routes allow viewing and searching for coupons.

---

## 🏷️ Coupon Type Reference

* `PERCENTAGE` — Discount value is treated as a percentage of order total.
* `FIXED` — Discount value is a flat amount.
