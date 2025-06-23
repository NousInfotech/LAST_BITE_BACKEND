import { Router } from "express";
import multer from "multer";
import { ImageUploadController } from "../controllers/imageUpload.controller.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import rateLimit from 'express-rate-limit';

const publicUploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // max 10 uploads per IP
  message: "Too many uploads from this IP, please try again later.",
});


// Multer setup (in-memory)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Only JPG, PNG and WebP allowed"));
    }
    cb(null, true);
  },
});


const imageUploadRouter = Router();
/**
 * @route POST /api/image-upload
 * @desc Upload an image (requires 'file' and 'folderName')
 */
imageUploadRouter.post(
  "/upload",
  upload.single("file"), // Multer middleware to handle file upload
  ImageUploadController.uploadImage
);


// ------------------------------
// Protected Routes (All Auth Roles)
// ------------------------------
imageUploadRouter.use(authMiddleware(["user", "restaurantAdmin", "rider", "superAdmin"]));


/**
 * @route PUT /api/image-upload
 * @desc Replace (update) an image (requires 'oldImageUrl', 'file', and 'folderName')
 */
imageUploadRouter.put(
  "/update",
  upload.single("file"), // Multer middleware for new file upload
  ImageUploadController.updateImage
);

/**
 * @route DELETE /api/image-upload
 * @desc Delete an image (requires 'imageUrl' in request body)
 */
imageUploadRouter.delete(
  "/delete",
  ImageUploadController.deleteImage
);

export default imageUploadRouter;
