import { Router } from "express";
import { MartProductController } from "../controllers/martProduct.controller.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";

const martProductRouter = Router();

// ------------------------------
// Public Routes (accessible by all authenticated users)
// ------------------------------
martProductRouter.get("/", MartProductController.getAllMartProducts);
martProductRouter.get("/martstore/:martStoreId", MartProductController.getMartProductsByStoreId);
martProductRouter.get("/hotdeals/:martStoreId", MartProductController.getHotDeals);
martProductRouter.get("/bulk", MartProductController.getMartProductById);
martProductRouter.get("/:martProductId", MartProductController.getMartProductById);


// ------------------------------
// Protected Routes (restaurantAdmin, martStoreAdmin & superAdmin)
// ------------------------------
martProductRouter.use(authMiddleware(["restaurantAdmin", "martStoreAdmin", "superAdmin"]));

martProductRouter.post("/", MartProductController.createMartProduct);
martProductRouter.put("/:martProductId", MartProductController.updateMartProduct);
martProductRouter.delete("/:martProductId", MartProductController.deleteMartProduct);


export default martProductRouter;
