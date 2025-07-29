import { Router } from "express";
import { MartProductController } from "../controllers/martProduct.controller.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";

const martProductRouter = Router();

// ------------------------------
// Public Routes
// ------------------------------
martProductRouter.get("/", MartProductController.getAllMartProducts);
martProductRouter.get("/bulk", MartProductController.getMartProductById);
martProductRouter.get("/martstore/:restaurantId", MartProductController.getMartProductsByStoreId);
martProductRouter.get("/:martProductId", MartProductController.getMartProductById);


// ------------------------------
// Protected Routes (restaurantAdmin & superAdmin)
// ------------------------------
martProductRouter.use(authMiddleware(["restaurantAdmin", "superAdmin"]));

martProductRouter.post("/", MartProductController.createMartProduct);
martProductRouter.put("/:martProductId", MartProductController.updateMartProduct);
martProductRouter.delete("/:martProductId", MartProductController.deleteMartProduct);


export default martProductRouter;
