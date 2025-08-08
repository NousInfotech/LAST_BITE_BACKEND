import { Router } from "express";
import { MartStoreAdminController } from "../controllers/martStoreAdmin.controller.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";

const martStoreAdminRouter = Router();

// ------------------------------
// Public Route - No Middleware
// ------------------------------
martStoreAdminRouter.post("/", MartStoreAdminController.createAdmin);

// ------------------------------
// Middleware for all routes below
// ------------------------------
martStoreAdminRouter.use(authMiddleware(["martStoreAdmin"]));

// ------------------------------
// Authenticated Admin Routes
// ------------------------------
martStoreAdminRouter.get("/", MartStoreAdminController.getAllAdmins)
martStoreAdminRouter.get("/:adminId", MartStoreAdminController.getAdminById);
martStoreAdminRouter.put("/:adminId", MartStoreAdminController.updateAdmin);
martStoreAdminRouter.delete("/:adminId", MartStoreAdminController.deleteAdmin);

// Mart Store Admin Orders
martStoreAdminRouter.get("/orders", MartStoreAdminController.getMartStoreOrders);

export default martStoreAdminRouter;
