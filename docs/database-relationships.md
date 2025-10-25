# 📊 LASTBITE Database Schema Relationships

> **Last Updated:** October 18, 2025  
> **Version:** 1.0  
> **Purpose:** Complete reference guide for all database entity relationships

---

## 📑 Table of Contents

1. [Overview](#overview)
2. [Entity ID References](#entity-id-references)
3. [Detailed Relationships](#detailed-relationships)
4. [Polymorphic Relationships](#polymorphic-relationships)
5. [Use Case Examples](#use-case-examples)

---

## 🎯 Overview

The LASTBITE system has **13 main entities** connected through various relationship types:
- **Direct Foreign Keys** - Explicit references
- **Embedded References** - IDs stored in arrays or subdocuments
- **Polymorphic Relationships** - Role-based dynamic references

### Entity Summary

| Entity | Primary Key | Purpose | Related Entities |
|--------|-------------|---------|------------------|
| Restaurant | `restaurantId` | Restaurant information | FoodItem, RestaurantAdmin, Order, Payment |
| User | `userId` | Customer accounts | Order, Payment, UserCollection, Issue |
| Order | `orderId` | Order records | User, Restaurant/MartStore, Payment, FoodItem/MartProduct |
| FoodItem | `foodItemId` | Restaurant menu items | Restaurant, Order, User (cart/favorites) |
| Payment | `paymentId` | Payment records | Order, Restaurant, User |
| MartStore | `martStoreId` | Mart store information | MartProduct, MartStoreAdmin, Order |
| MartProduct | `martProductId` | Mart store products | MartStore, Order |
| MartStoreAdmin | `martStoreAdminId` | Mart store administrators | MartStore |
| RestaurantAdmin | `restaurantAdminId` | Restaurant administrators | Restaurant |
| Coupon | `couponId` | Discount coupons | Order |
| Issue | `issueId` | Support tickets | Order, User, Restaurant, Rider |
| Notification | `notificationId` | Push notifications | User, RestaurantAdmin, MartStoreAdmin |
| Rider | `riderId` | Delivery partners | Order (via Pidge) |

---

## 🔑 Entity ID References

### 1️⃣ restaurantId

**Native (Owner):**
- ✅ `Restaurant` schema

**Foreign References (Alien):**
- `Order.refIds.restaurantId` - Restaurant that received the order
- `FoodItem.restaurantId` - Restaurant that owns the food item
- `RestaurantAdmin.restaurantId` - Restaurant being managed
- `Payment.ref.restaurantId` - Restaurant receiving payment
- `User.cart[].restaurantId` - Restaurant of cart items
- `User.favourites.restaurants[]` - Favorited restaurants
- `User.hiddenRestaurants[]` - Hidden restaurants
- `Issue.targetId` or `Issue.raisedById` - When role is restaurantAdmin
- `Notification.targetRoleId` - When targetRole is restaurantAdmin

**Special Notes:**
- When `restaurantId` starts with `'mart_'`, it refers to a MartStore, not a Restaurant
- Order system uses the same field for both restaurants and mart stores

---

### 2️⃣ userId

**Native (Owner):**
- ✅ `User` schema

**Foreign References (Alien):**
- `Order.refIds.userId` - Customer who placed the order
- `Payment.ref.userId` - Customer who made the payment
- `Issue.targetId` or `Issue.raisedById` - When role is user
- `Notification.targetRoleId` - When targetRole is user
- `UserCollection.userId` - Owner of the collection

**Special Notes:**
- User is the primary customer entity
- Connected to orders, payments, and support systems

---

### 3️⃣ orderId

**Native (Owner):**
- ✅ `Order` schema

**Foreign References (Alien):**
- `Payment.linkedOrderId` - Payment for this order
- `Issue.relatedOrderId` - Issue related to this order (optional)
- `Notification.metadata.orderId` - Notifications about this order (flexible field)

**Special Notes:**
- Central entity connecting users, restaurants, payments, and delivery
- Most business logic revolves around orders

---

### 4️⃣ foodItemId

**Native (Owner):**
- ✅ `FoodItem` schema

**Foreign References (Alien):**
- `Order.foodItems[].foodItemId` - Items in the order
- `User.cart[].foodItemId` - Items in user's cart
- `User.favourites.foodItems[]` - User's favorite items
- `UserCollection.foodItemIds[]` - Items in custom collections

**Special Notes:**
- Represents restaurant menu items
- Can be in multiple orders, carts, and collections simultaneously

---

### 5️⃣ martStoreId

**Native (Owner):**
- ✅ `MartStore` schema

**Foreign References (Alien):**
- `MartStoreAdmin.martStoreId` - Admin managing this mart store
- `MartProduct.martStoreId` - Products belonging to this mart store
- `Order.refIds.restaurantId` - When order is from mart store (starts with `'mart_'`)
- `Notification.targetRoleId` - When targetRole is martStoreAdmin

**Special Notes:**
- Mart stores are the "Instamart" convenience stores
- Share the order system with restaurants via the `restaurantId` field

---

### 6️⃣ martProductId

**Native (Owner):**
- ✅ `MartProduct` schema

**Foreign References (Alien):**
- `Order.foodItems[].foodItemId` - When order is from a mart store

**Special Notes:**
- Mart products use the same `foodItems` array field in orders as restaurant food items
- Distinguished by checking if the parent order's `restaurantId` starts with `'mart_'`

---

### 7️⃣ couponId

**Native (Owner):**
- ✅ `Coupon` schema

**Foreign References (Alien):**
- `Order.coupons[].couponId` - Coupons applied to orders

**Special Notes:**
- Multiple coupons can be applied to a single order
- Tracks usage count and limits

---

### 8️⃣ paymentId

**Native (Owner):**
- ✅ `Payment` schema

**Foreign References (Alien):**
- `Order.payment.paymentId` - Payment for the order

**Special Notes:**
- 1:1 relationship with Order
- Contains Razorpay integration details

---

### 9️⃣ riderId

**Native (Owner):**
- ✅ `Rider` schema

**Foreign References (Alien):**
- `Order.feedback.riderRating` - Indirect reference via feedback
- Delivery tracked via Pidge integration in `Order.delivery.pidge`

**Special Notes:**
- No direct foreign key relationships
- Integration happens through Pidge third-party delivery service

---

### 🔟 restaurantAdminId

**Native (Owner):**
- ✅ `RestaurantAdmin` schema

**Foreign References (Alien):**
- Currently no direct foreign key references
- Referenced implicitly through `restaurantId` relationships

---

### 1️⃣1️⃣ martStoreAdminId

**Native (Owner):**
- ✅ `MartStoreAdmin` schema

**Foreign References (Alien):**
- Currently no direct foreign key references
- Referenced implicitly through `martStoreId` relationships

---

### 1️⃣2️⃣ issueId

**Native (Owner):**
- ✅ `Issue` schema

**Foreign References (Alien):**
- Currently no direct foreign key references

---

### 1️⃣3️⃣ notificationId

**Native (Owner):**
- ✅ `Notification` schema

**Foreign References (Alien):**
- Currently no direct foreign key references

---

## 🔗 Detailed Relationships

### Restaurant → FoodItem (1:N)
- **Type:** One-to-Many
- **Foreign Key:** `FoodItem.restaurantId`
- **Description:** Each restaurant has multiple food items in their menu

```typescript
// Find all food items for a restaurant
const foodItems = await FoodItemModel.find({ restaurantId: 'res_xxx' });
```

---

### Restaurant → RestaurantAdmin (1:1)
- **Type:** One-to-One
- **Foreign Key:** `RestaurantAdmin.restaurantId`
- **Description:** Each restaurant has one admin account

```typescript
// Find admin for a restaurant
const admin = await RestaurantAdminModel.findOne({ restaurantId: 'res_xxx' });
```

---

### User → Order (1:N)
- **Type:** One-to-Many
- **Foreign Key:** `Order.refIds.userId`
- **Description:** Each user can place multiple orders

```typescript
// Find all orders for a user
const orders = await OrderModel.find({ 'refIds.userId': 'usr_xxx' });
```

---

### Restaurant/MartStore → Order (1:N)
- **Type:** One-to-Many
- **Foreign Key:** `Order.refIds.restaurantId`
- **Description:** Each restaurant/mart store receives multiple orders

```typescript
// Find all orders for a restaurant
const orders = await OrderModel.find({ 'refIds.restaurantId': 'res_xxx' });

// Find all orders for a mart store
const martOrders = await OrderModel.find({ 'refIds.restaurantId': 'mart_xxx' });
```

---

### Order → Payment (1:1)
- **Type:** One-to-One
- **Foreign Keys:** `Payment.linkedOrderId` and `Order.payment.paymentId`
- **Description:** Each order has one payment record

```typescript
// Find payment for an order
const payment = await PaymentModel.findOne({ linkedOrderId: 'ord_xxx' });
```

---

### Order ↔ FoodItem/MartProduct (M:N)
- **Type:** Many-to-Many (Embedded)
- **Foreign Key:** `Order.foodItems[].foodItemId`
- **Description:** Orders contain multiple items, items can be in multiple orders

```typescript
// Find all orders containing a specific food item
const orders = await OrderModel.find({ 
  'foodItems.foodItemId': 'food_xxx' 
});
```

---

### User ↔ FoodItem (M:N) - Cart & Favorites
- **Type:** Many-to-Many (Embedded)
- **Foreign Keys:** 
  - `User.cart[].foodItemId`
  - `User.favourites.foodItems[]`
- **Description:** Users can have multiple items in cart/favorites

```typescript
// Find all users who have a food item in their cart
const users = await UserModel.find({ 
  'cart.foodItemId': 'food_xxx' 
});

// Find all users who favorited a food item
const fans = await UserModel.find({ 
  'favourites.foodItems': 'food_xxx' 
});
```

---

### MartStore → MartProduct (1:N)
- **Type:** One-to-Many
- **Foreign Key:** `MartProduct.martStoreId`
- **Description:** Each mart store has multiple products

```typescript
// Find all products for a mart store
const products = await MartProductModel.find({ martStoreId: 'mart_xxx' });
```

---

### MartStore → MartStoreAdmin (1:1)
- **Type:** One-to-One
- **Foreign Key:** `MartStoreAdmin.martStoreId`
- **Description:** Each mart store has one admin account

```typescript
// Find admin for a mart store
const admin = await MartStoreAdminModel.findOne({ martStoreId: 'mart_xxx' });
```

---

## 🎭 Polymorphic Relationships

### Issue System
Issues use polymorphic relationships via role-based IDs:

```typescript
interface IIssue {
  raisedByRole: 'user' | 'restaurantAdmin' | 'martStoreAdmin' | 'rider';
  raisedById: string; // ID of the user who raised the issue
  targetRole: 'user' | 'restaurantAdmin' | 'restaurant' | 'order';
  targetId: string; // ID of the target entity
  relatedOrderId?: string; // Optional order reference
}
```

**Examples:**
- User raises issue about restaurant: 
  - `raisedByRole: 'user'`, `raisedById: 'usr_xxx'`
  - `targetRole: 'restaurant'`, `targetId: 'res_xxx'`
- Restaurant raises issue about order:
  - `raisedByRole: 'restaurantAdmin'`, `raisedById: 'res_xxx'`
  - `targetRole: 'order'`, `targetId: 'ord_xxx'`
  - `relatedOrderId: 'ord_xxx'`

---

### Notification System
Notifications use polymorphic relationships:

```typescript
interface INotification {
  targetRole: 'user' | 'restaurantAdmin' | 'martStoreAdmin';
  targetRoleId: string; // ID of the recipient
  metadata?: {
    orderId?: string;
    // ... other flexible fields
  };
}
```

**Examples:**
- Notify user about order:
  - `targetRole: 'user'`, `targetRoleId: 'usr_xxx'`
  - `metadata: { orderId: 'ord_xxx' }`
- Notify restaurant about new order:
  - `targetRole: 'restaurantAdmin'`, `targetRoleId: 'res_xxx'`
  - `metadata: { orderId: 'ord_xxx' }`

---

## 💡 Use Case Examples

### 1. Fetching Orders with Restaurant Details

```typescript
// Using the new use case
const enrichedOrders = await OrderUseCase.getOrdersWithRestaurantDetails();

// Result includes:
// - All order data
// - restaurantName (populated)
// - restaurantType ('restaurant' or 'mart')
// - restaurantDetails or martStoreDetails (full info)
```

### 2. Finding All Orders for a User's Favorite Restaurants

```typescript
const user = await UserModel.findOne({ userId: 'usr_xxx' });
const favoriteRestaurants = user.favourites.restaurants;

const orders = await OrderModel.find({
  'refIds.restaurantId': { $in: favoriteRestaurants }
});
```

### 3. Getting All Food Items in a User's Cart with Restaurant Info

```typescript
const user = await UserModel.findOne({ userId: 'usr_xxx' });
const cartItems = user.cart;

for (const cartItem of cartItems) {
  const foodItem = await FoodItemModel.findOne({ 
    foodItemId: cartItem.foodItemId 
  });
  const restaurant = await RestaurantModel.findOne({ 
    restaurantId: cartItem.restaurantId 
  });
  
  console.log(`${foodItem.name} from ${restaurant.restaurantName}`);
}
```

### 4. Finding All Issues Related to an Order

```typescript
const issues = await IssueModel.find({
  $or: [
    { relatedOrderId: 'ord_xxx' },
    { targetRole: 'order', targetId: 'ord_xxx' }
  ]
});
```

### 5. Sending Notifications to All Users Who Ordered from a Restaurant

```typescript
const orders = await OrderModel.find({ 
  'refIds.restaurantId': 'res_xxx' 
});

const userIds = [...new Set(orders.map(o => o.refIds.userId))];

for (const userId of userIds) {
  await NotificationModel.create({
    targetRole: 'user',
    targetRoleId: userId,
    message: 'Special offer from your favorite restaurant!',
    type: 'promo'
  });
}
```

---

## 🎯 Key Design Patterns

### 1. **Dual Entity Pattern (Restaurant/MartStore)**
- Orders use `restaurantId` field for both restaurants and mart stores
- Differentiate by checking if ID starts with `'mart_'`
- Allows code reuse while maintaining separate entity types

### 2. **Embedded Arrays for Many-to-Many**
- User cart, favorites use embedded arrays instead of join tables
- Provides fast reads, denormalized data
- Trade-off: Updates require array manipulation

### 3. **Polymorphic References**
- Issues and Notifications use role-based IDs
- Flexible targeting without multiple foreign keys
- Enables extensibility for new entity types

### 4. **Metadata Flexibility**
- Notifications use `metadata: Mixed` for extensibility
- Allows adding context without schema changes
- Useful for evolving notification types

---

## 📊 Cardinality Summary

| Relationship | Type | Notes |
|--------------|------|-------|
| Restaurant ↔ FoodItem | 1:N | One restaurant, many items |
| Restaurant ↔ RestaurantAdmin | 1:1 | One restaurant, one admin |
| Restaurant ↔ Order | 1:N | One restaurant, many orders |
| User ↔ Order | 1:N | One user, many orders |
| User ↔ Restaurant | M:N | Favorites (embedded array) |
| User ↔ FoodItem | M:N | Cart & Favorites (embedded) |
| Order ↔ FoodItem | M:N | Embedded in order |
| Order ↔ Payment | 1:1 | One order, one payment |
| Order ↔ Coupon | M:N | Multiple coupons per order |
| MartStore ↔ MartProduct | 1:N | One store, many products |
| MartStore ↔ MartStoreAdmin | 1:1 | One store, one admin |
| MartStore ↔ Order | 1:N | One store, many orders |
| User ↔ UserCollection | 1:N | One user, many collections |
| UserCollection ↔ FoodItem | M:N | Embedded array |

---

## 🔍 Query Patterns

### Finding Related Data

```typescript
// Get all entities related to an order
const order = await OrderModel.findOne({ orderId: 'ord_xxx' });
const user = await UserModel.findOne({ userId: order.refIds.userId });
const restaurant = await RestaurantModel.findOne({ 
  restaurantId: order.refIds.restaurantId 
});
const payment = await PaymentModel.findOne({ linkedOrderId: order.orderId });

// Get food items in order
const foodItemIds = order.foodItems.map(item => item.foodItemId);
const foodItems = await FoodItemModel.find({ 
  foodItemId: { $in: foodItemIds } 
});
```

---

**End of Document** 📄

