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

restaurantRouter.patch("/status/:restaurantId", authMiddleware(["superAdmin", "restaurantAdmin"]), RestaurantController.updateRestaurantStatus);
restaurantRouter.patch("/active/:restaurantId", authMiddleware(["superAdmin", "restaurantAdmin"]), RestaurantController.toggleRestaurantActive);
restaurantRouter.use(authMiddleware(["restaurantAdmin", "superAdmin", "user", "rider"]));


restaurantRouter.put("/:restaurantId", RestaurantController.updateRestaurant);
restaurantRouter.delete("/:restaurantId", authMiddleware(["superAdmin", "restaurantAdmin"]), RestaurantController.deleteRestaurant);
restaurantRouter.get("/", RestaurantController.getAllRestaurants);
restaurantRouter.get("/search", RestaurantController.searchRestaurantsAndDishes);
restaurantRouter.get("/bulk", RestaurantController.getAllRestauransById);
restaurantRouter.get("/:restaurantId", RestaurantController.getRestaurantById);
export default restaurantRouter;
