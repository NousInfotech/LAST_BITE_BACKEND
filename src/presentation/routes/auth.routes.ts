import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";

const authRouter = Router();

// ------------------------------
// Public Route - No Middleware
// ------------------------------

authRouter.post("/send-otp", AuthController.sendOtp);
authRouter.post("/verify-otp", AuthController.verifyOtp);
authRouter.post("/check-login", AuthController.checkLogin);
authRouter.post("/super-admin-login", AuthController.superAdminLogin);

authRouter.use(authMiddleware(["user", "restaurantAdmin", "rider", "superAdmin"]));


// ------------------------------
// Authenticated & Authorized Routes
// ------------------------------
authRouter.get("/check", AuthController.checkAuth)

export default authRouter;
