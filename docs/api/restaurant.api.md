Here's a **complete and clean copy-pasteable API documentation** for both **Restaurant** and **FoodItem** modules with all **CRUD** operations and routes, formatted in markdown and structured like proper API docs.

---

## 📄 `restaurant.api.md`

````md
# 🍽️ Restaurant API

Base URL: `/api/restaurants`

---

## 🔓 PUBLIC ROUTES

### ✅ GET `/`
**Description**: Get all restaurants.

**Response**
- `200 OK`: List of restaurants.

---

## 🔐 AUTHENTICATED ROUTES (restaurantAdmin)

> These routes require authentication and the `restaurantAdmin` role.

### ✅ GET `/:restaurantId`
**Description**: Get a specific restaurant by its custom ID.

**Path Parameters**
- `restaurantId` (string): Custom restaurant ID.

**Response**
- `200 OK`: Restaurant object.
- `404 Not Found`: Restaurant not found.

---

### ✅ POST `/`
**Description**: Create a new restaurant.

**Request Body**
```json
{
  "restaurantName": "Green Garden",
  "address": {
    "location": { "type": "Point", "coordinates": [77.5946, 12.9716] },
    "no": "123",
    "street": "MG Road",
    "area": "Central",
    "city": "Bangalore",
    "state": "Karnataka",
    "country": "India",
    "fullAddress": "123 MG Road, Central, Bangalore, Karnataka, India",
    "tag": "office"
  },
  "documents": {
    "panNumber": "ABCDE1234F",
    "panImage": "pan-image-url",
    "shopLicenseImage": "license-image-url",
    "fssaiCertificateNumber": "FSSAI123456",
    "fssaiCertificateImage": "fssai-image-url",
    "gstinNumber": "29ABCDE1234F1Z5",
    "gstCertificateImage": "gst-image-url",
    "cancelledChequeImage": "cheque-image-url",
    "bankIFSC": "SBIN0001234",
    "bankAccountNumber": "1234567890"
  },
  "timings": [
    {
      "day": "monday",
      "shifts": [
        { "start": "10:00", "end": "14:00" },
        { "start": "18:00", "end": "22:00" }
      ]
    }
  ],
  "tags": ["organic", "family-friendly"],
  "cuisines": ["Indian", "Continental"],
  "typeOfFood": ["vegan", "organic"],
  "profilePhoto": "https://example.com/image.jpg",
  "isActive": true,
  "availableCategories": ["biryani", "salads"],
  "rating": 4.5
}
````

**Response**

* `201 Created`: Restaurant created.
* `400 Bad Request`: Validation error.

---

### ✅ PUT `/:restaurantId`

**Description**: Update an existing restaurant.

**Request Body**: Same as POST (fields optional for partial update).

**Response**

* `200 OK`: Restaurant updated.
* `404 Not Found`: Restaurant not found.

---

### ✅ DELETE `/:restaurantId`

**Description**: Delete a restaurant.

**Response**

* `200 OK`: Restaurant deleted.
* `404 Not Found`: Restaurant not found.

````

---

