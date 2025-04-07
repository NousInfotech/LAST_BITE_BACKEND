# 📘 User API Documentation

> Authentication: **Bearer Token (Firebase)** required for all routes _except_ `POST /users`

---

## 👤 User Routes

### ➕ Create User  
`POST /users`

- **Body:**
  ```json
  {
    "name": "John Doe",
    "phoneNumber": "9876543210",
    "firebaseId": "firebase_xyz",
    "email": "john@example.com",
    "profileImage": "url",
    "addresses": [ ... ] // optional
  }
  ```
- **Auth:** ❌ No  
- **Returns:** `201 Created` | `400 Bad Request`

---

### 🔍 Get User by `userId`  
`GET /users/{userId}`

- **Auth:** ✅ Yes  
- **Returns:** `200 OK` | `404 Not Found`

---

### 🔍 Get User by Firebase ID  
`GET /users/firebase/{firebaseId}`

- **Auth:** ✅ Yes  
- **Returns:** `200 OK` | `404 Not Found`

---

### ✏️ Update User  
`PUT /users/{userId}`

- **Body (Partial):**
  ```json
  {
    "name": "New Name",
    "email": "new@email.com"
  }
  ```
- **Auth:** ✅ Yes  
- **Returns:** `200 OK` | `404 Not Found`

---

### ❌ Delete User  
`DELETE /users/{userId}`

- **Auth:** ✅ Yes  
- **Returns:** `200 OK` | `404 Not Found`

---

## 📍 Address Routes (Nested under User)

### ➕ Add Address  
`POST /users/{userId}/addresses`

- **Body:**
  ```json
  {
    "latitude": 12.9,
    "longitude": 77.6,
    "no": "12A",
    "street": "MG Road",
    "area": "Indiranagar",
    "city": "Bangalore",
    "state": "Karnataka",
    "country": "India",
    "address": "12A, MG Road, Indiranagar, Bangalore",
    "tag": "home"
  }
  ```
- **Auth:** ✅ Yes  
- **Returns:** `200 OK`

---

### 📥 Get All Addresses  
`GET /users/{userId}/addresses`

- **Auth:** ✅ Yes  
- **Returns:** List of address objects

---

### ✏️ Update Address  
`PUT /users/{userId}/addresses/{addressId}`

- **Body (Partial or Full):** Same as Add Address  
- **Auth:** ✅ Yes  
- **Returns:** `200 OK`

---

### ❌ Delete Address  
`DELETE /users/{userId}/addresses/{addressId}`

- **Auth:** ✅ Yes  
- **Returns:** `200 OK`

---

## 🔐 Authentication Middleware

All routes (except `POST /users`) require a valid **Firebase token** passed via the `Authorization: Bearer <token>` header.
