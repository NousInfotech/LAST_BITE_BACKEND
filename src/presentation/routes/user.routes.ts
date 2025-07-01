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
userRouter.use(authMiddleware(["user"]));  // Applying the middleware to protect routes


// ------------------------------
// Authenticated User Routes
// ------------------------------
userRouter.get("/me", UserController.getUserByUserId);
userRouter.put("/me", UserController.updateUser);
userRouter.delete("/me", UserController.deleteUser);
userRouter.patch("/favorites", UserController.updateUserFavourites);
userRouter.patch("/blocked-restaurants", UserController.updateUserBlcokedRestaurants)

// ------------------------------
// Address Routes (nested under userId)
// ------------------------------
userRouter.post("/me/addresses", UserController.addAddress);
userRouter.get("/me/addresses", UserController.getAddresses);
userRouter.put("/me/addresses/:addressId", UserController.updateAddress);
userRouter.delete("/me/addresses/:addressId", UserController.deleteAddress);

// ------------------------------
// Collection Routes (nested under userId)
// ------------------------------
userRouter.post("/wishlist", UserController.createCollection);
userRouter.get("/wishlist", UserController.getCollections);
userRouter.put("/wishlist/:collectionId", UserController.updateCollection);
userRouter.delete("/wishlist/food-item", UserController.removeFoodItem);
userRouter.delete("/wishlist/:collectionId", UserController.deleteCollection);

export default userRouter;
