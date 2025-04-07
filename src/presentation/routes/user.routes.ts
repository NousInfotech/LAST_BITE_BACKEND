import { Router } from "express";
import { UserController } from "../controllers/user.controller.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";

const userRouter = Router();

// ------------------------------
// Public Route - No Middleware
// ------------------------------
userRouter.post("/", UserController.createUser);

// ------------------------------
// Middleware for all routes below
// ------------------------------
userRouter.use(authMiddleware);

// ------------------------------
// Authenticated User Routes
// ------------------------------
userRouter.get("/:userId", UserController.getUserByUserId);
userRouter.get("/firebase/:firebaseId", UserController.getUserByUserFireBaseId);
userRouter.put("/:userId", UserController.updateUser);
userRouter.delete("/:userId", UserController.deleteUser);

// ------------------------------
// Address Routes (nested under userId)
// ------------------------------
userRouter.post("/:userId/addresses", UserController.addAddress);
userRouter.get("/:userId/addresses", UserController.getAddresses);
userRouter.put("/:userId/addresses/:addressId", UserController.updateAddress);
userRouter.delete("/:userId/addresses/:addressId", UserController.deleteAddress);

export default userRouter;
