import { Router } from "express";
import { FoodItemController } from "../controllers/foodItem.controller.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";

const foodItemRouter = Router();

// ------------------------------
// Public Routes
// ------------------------------
foodItemRouter.get("/", FoodItemController.getAllFoodItems);
foodItemRouter.get("/bulk", FoodItemController.getAllFoodItemsById);
foodItemRouter.get("/:foodItemId", FoodItemController.getFoodItemById);
foodItemRouter.get("/restaurant/:restaurantId", FoodItemController.getFoodItemByRestaurantId);
// foodItemRouter.get("/restaurant/:restaurantId", FoodItemController.getAllFoodItemsById);

// ------------------------------
// Protected Routes (restaurantAdmin & superAdmin)
// ------------------------------
foodItemRouter.use(authMiddleware(["restaurantAdmin", "superAdmin"]));

foodItemRouter.post("/", FoodItemController.createFoodItem);
foodItemRouter.put("/:foodItemId", FoodItemController.updateFoodItem);
foodItemRouter.delete("/:foodItemId", FoodItemController.deleteFoodItem);


export default foodItemRouter;
