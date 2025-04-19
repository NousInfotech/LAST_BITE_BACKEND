

### 📁 `docs/auth.api.md`

```md
# 🔐 Auth API Documentation

> These endpoints handle OTP-based authentication for users, riders, and restaurant admins.

---

## 📤 Send OTP  
**POST** `/auth/send-otp`

- **Description:** Sends an OTP to the provided phone number.

- **Body:**
```json
{
  "phoneNumber": "+919876543210"
}
```

- **Auth Required:** ❌ No

- **Responses:**
  - `200 OK`: OTP sent successfully.
  - `400 Bad Request`: Invalid phone number or OTP could not be sent.

---

## ✅ Verify OTP  
**POST** `/auth/verify-otp`

- **Description:** Verifies the OTP for the provided phone number and role. Returns a JWT token if successful.

- **Body:**
```json
{
  "phoneNumber": "+919876543210",
  "otp": "123456",
  "role": "user"
}
```

- **Auth Required:** ❌ No

- **Responses:**
  - `200 OK`: OTP verified, token returned.
```json
{
  "token": "JWT_TOKEN"
}
```
  - `401 Unauthorized`: Invalid OTP.
  - `404 Not Found`: No user found with the given phone and role.

---

## 👁️ Check Login  
**POST** `/auth/check-login`

- **Description:** Checks if a user exists for the given phone number and role.

- **Body:**
```json
{
  "phoneNumber": "+919876543210",
  "role": "user"
}
```

- **Auth Required:** ❌ No

- **Responses:**
  - `200 OK`: User exists.
```json
{
  "role": "user",
  "phoneNumber": "+919876543210",
  "userId": "UUID"
}
```
  - `404 Not Found`: No user found.

---

## 📌 Notes

- Roles supported: `"user"`, `"rider"`, `"restaurantAdmin"`
- Phone number format must be: `+91XXXXXXXXXX`
- JWT token payload:
```json
{
  "role": "user",
  "roleBasedId": "UUID"
}
