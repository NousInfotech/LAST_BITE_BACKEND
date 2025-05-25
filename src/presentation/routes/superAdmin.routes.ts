import { Router } from "express";
import { SuperAdminController } from "../controllers/superAdmin.controller.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";

const superAdminRouter = Router();

// ------------------------------
// Public Route - Only for creation (bootstrapping)
// ------------------------------
superAdminRouter.post("/", SuperAdminController.createSuperAdmin);

// ------------------------------
// Protect all routes below with super-admin role
// ------------------------------
superAdminRouter.use(authMiddleware(["superAdmin"]));

// ------------------------------
// Authenticated Super Admin Routes
// ------------------------------
superAdminRouter.get("/", SuperAdminController.getAllSuperAdmins);
superAdminRouter.get("/:superAdminId", SuperAdminController.getSuperAdminById);
superAdminRouter.get("/email/:email", SuperAdminController.getSuperAdminByEmail);
superAdminRouter.put("/:superAdminId", SuperAdminController.updateSuperAdmin);
superAdminRouter.delete("/:superAdminId", SuperAdminController.removeSuperAdmin);

export default superAdminRouter;
