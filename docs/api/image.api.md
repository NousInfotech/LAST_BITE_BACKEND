# Image Upload API Documentation

Base URL: `/api/image`

All routes are **protected** and require authentication. Allowed roles:  
`user`, `restaurantAdmin`, `rider`, `superAdmin`

---

## 1. Upload Image

### Endpoint  

`POST /api/image`

### Description  

Upload a new image to a specified folder.

### Request Headers  

`Authorization: Bearer <token>`

### Request Body (multipart/form-data)  

| Field      | Type     | Description                      |
|------------|----------|--------------------------------|
| file       | File     | Image file to upload            |
| folderName | String   | Target folder name for the image (e.g., `restaurants`) |

### Response  

- **200 OK**  

```json
{
  "success":true,
  "message": "Image Uploaded successfully",
  "data": "<public_image_url>"
}
````

- **4XX** on validation, auth, or file errors

---

## 2. Update (Replace) Image

### Endpoint

`PUT /api/image`

### Description

Replace an existing image by deleting the old one and uploading a new one.

### Request Headers

`Authorization: Bearer <token>`

### Request Body (multipart/form-data)

| Field       | Type   | Description                                      |
| ----------- | ------ | ------------------------------------------------ |
| file        | File   | New image file to upload                         |
| folderName  | String | Target folder name                               |
| oldImageUrl | String | URL of the existing image to be replaced/deleted |

### Response

- **200 OK**

```json
{
  "success":true,
  "message": "Image replaced successfully",
  "data": "<new_public_image_url>"
}
```

- **4XX** on validation, auth, or file errors

---

## 3. Delete Image

### Endpoint

`DELETE /api/image`

### Description

Delete an existing image by providing its URL.

### Request Headers

`Authorization: Bearer <token>`

### Request Body (application/json)

| Field    | Type   | Description                    |
| -------- | ------ | ------------------------------ |
| imageUrl | String | URL of the image to be deleted |

### Response

- **200 OK**

```json
{
  "success":true,
  "message": "Image deleted successfully",
  "data": true
}
```

- **400 Bad Request** if imageUrl is missing
- **404 Not Found** if deletion fails

---

## Notes

- All requests require valid authentication and authorization.
- `folderName` must be one of the allowed folders according to user role.
- File uploads only accept image files.
- Responses follow the JSON format with `message` and `data` fields.

---
