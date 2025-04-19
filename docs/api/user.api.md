## 👤 User API

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
```

