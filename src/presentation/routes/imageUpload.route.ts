import { Router } from "express";
import multer from "multer";
import { ImageUploadController } from "../controllers/imageUpload.controller.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";

// Multer setup (in-memory)
const upload = multer({ storage: multer.memoryStorage() });

const imageUploadRouter = Router();

// ------------------------------
// Protected Routes (All Auth Roles)
// ------------------------------
imageUploadRouter.use(authMiddleware(["user", "restaurantAdmin", "rider", "superAdmin"]));

/**
 * @route POST /api/image-upload
 * @desc Upload an image (requires 'file' and 'folderName')
 */ 
imageUploadRouter.post(
  "/",
  upload.single("file"), // Multer middleware to handle file upload
  ImageUploadController.uploadImage
);

export default imageUploadRouter;
