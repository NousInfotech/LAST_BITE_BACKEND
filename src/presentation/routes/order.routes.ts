import { Router } from "express";
import { OrderController } from "../controllers/order.controller.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";

const orderRouter = Router();

orderRouter.use(authMiddleware(["user"]))

orderRouter.post("/online", OrderController.createOrder);
orderRouter.post("/verify", OrderController.verifyOrder);
orderRouter.patch('/status/:orderId', OrderController.updateOrderStatus);


export default orderRouter