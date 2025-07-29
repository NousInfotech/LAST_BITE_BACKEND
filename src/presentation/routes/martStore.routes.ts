import { Router } from "express";
import { MartStoreController } from "../controllers/martStore.controller.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";

const martStoreRouter = Router();

// ------------------------------
// Middleware for routes below - auth required
// Only allow roles that can create/update/delete martStores
// For example: 'martStoreAdmin', 'superAdmin' (adjust as needed)
// ------------------------------


martStoreRouter.post("/", MartStoreController.createMartStore);


// ------------------------------
// Authenticated & Authorized Routes
// ------------------------------

martStoreRouter.patch("/status/:martStoreId", authMiddleware(["superAdmin"]), MartStoreController.updateMartStore);
martStoreRouter.use(authMiddleware(["martStoreAdmin", "superAdmin", "user", "rider"]));


martStoreRouter.put("/:martStoreId", MartStoreController.updateMartStore);
martStoreRouter.delete("/:martStoreId", authMiddleware(["superAdmin"]), MartStoreController.deleteMartStore);
martStoreRouter.get("/", MartStoreController.getAllMartStores);
martStoreRouter.get("/bulk", MartStoreController.getAllMartStoresById);
martStoreRouter.get("/:martStoreId", MartStoreController.getMartStoreById);
export default martStoreRouter;
