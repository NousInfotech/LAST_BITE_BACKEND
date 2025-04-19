import { Router } from "express";
import { RestaurantAdminController } from "../controllers/restaurantAdmin.controller.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";

const restaurantAdminRouter = Router();

// ------------------------------
// Public Route - No Middleware
// ------------------------------
restaurantAdminRouter.post("/", RestaurantAdminController.createAdmin);

// ------------------------------
// Middleware for all routes below
// ------------------------------
restaurantAdminRouter.use(authMiddleware(["restaurantAdmin"]));

// ------------------------------
// Authenticated Admin Routes
// ------------------------------
restaurantAdminRouter.get("/:adminId", RestaurantAdminController.getAdminById);
restaurantAdminRouter.put("/:adminId", RestaurantAdminController.updateAdmin);
restaurantAdminRouter.delete("/:adminId", RestaurantAdminController.deleteAdmin);

export default restaurantAdminRouter;
