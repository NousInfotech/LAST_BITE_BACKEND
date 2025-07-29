## 🍽️ Restaurant Admin API

```ts
// POST /restaurant-admins
// Public Route
{
  restaurantAdminId: string (uuid);
  restaurantId: string;
  name: string;
  phoneNumber: `+91` + 10 digit number;
  email?: string;
}

// GET /restaurant-admins/me
// Authenticated Route
// Uses decoded JWT to get restaurantAdminId

// PUT /restaurant-admins/me
{
  name?: string;
  phoneNumber?: string;
  email?: string;
}

// DELETE /restaurant-admins/me
```

// All routes use Bearer JWT Auth
// Middleware attaches `req.restaurantAdminId`

