import { Router } from "express";
import { OrderController } from "../controllers/order.controller.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";

const orderRouter = Router();

// ------------------------------
// Protected Routes (user)
// ------------------------------
orderRouter.use(authMiddleware(["user"]));

orderRouter.post("/payment/create", OrderController.createRazorpayOrder);
orderRouter.post("/payment/verify", OrderController.verifyRazorpayPayment);
orderRouter.post("/create", OrderController.createCODOrder);

export default orderRouter;
