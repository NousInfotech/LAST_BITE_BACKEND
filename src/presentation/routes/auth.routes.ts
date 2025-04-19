import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";

const authRouter = Router();

// ------------------------------
// Public Route - No Middleware
// ------------------------------

authRouter.post("/send-otp", AuthController.sendOtp);
authRouter.post("/verify-otp", AuthController.verifyOtp);
authRouter.post("/check-login", AuthController.checkLogin);

export default authRouter;
