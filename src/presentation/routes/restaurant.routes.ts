import { Router } from "express";
import { RestaurantController } from "../controllers/restaurant.controller.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";

const restaurantRouter = Router();

// ------------------------------
// Middleware for routes below - auth required
// Only allow roles that can create/update/delete restaurants
// For example: 'restaurantAdmin', 'superAdmin' (adjust as needed)
// ------------------------------
restaurantRouter.post("/", RestaurantController.createRestaurant);


// ------------------------------
// Authenticated & Authorized Routes
// ------------------------------
restaurantRouter.use(authMiddleware(["restaurantAdmin", "superAdmin"]));
restaurantRouter.get("/", RestaurantController.getAllRestaurants);
restaurantRouter.get("/:restaurantId", RestaurantController.getRestaurantById);
restaurantRouter.put("/:restaurantId", RestaurantController.updateRestaurant);
restaurantRouter.delete("/:restaurantId", RestaurantController.deleteRestaurant);
export default restaurantRouter;
