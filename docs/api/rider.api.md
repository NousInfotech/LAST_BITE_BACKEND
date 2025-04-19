## 🛵 Rider API

```ts
// POST /riders
// Public Route
{
  riderId: string (uuid);
  name: string;
  phoneNumber: `+91` + 10 digit number;
  email?: string;
  dateOfBirth?: string;
  address?: Address;
  vehicleType: "bike" | "scooter" | "car";
  vehicleNumber?: string;
  licenseNumber?: string;
  aadharNumber?: string;
  profilePhoto?: string;
  documentProofs?: string[];
  isVerified?: boolean;
  isAvailable?: boolean;
  lastLocation?: { lat: number; lng: number };
}

// GET /riders/me
// Authenticated Route
// Uses decoded JWT to get riderId

// PUT /riders/me
// Partial update allowed (same schema as above)

// DELETE /riders/me
```

// All routes use Bearer JWT Auth
// Middleware attaches `req.riderId`

