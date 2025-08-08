import { Router } from "express";
import { OrderController } from "../controllers/order.controller.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";

const orderRouter = Router();

orderRouter.use(authMiddleware(["user", "martStoreAdmin", "restaurantAdmin"]))

orderRouter.post("/online", OrderController.createOrder);
orderRouter.post("/verify", OrderController.verifyOrder);
orderRouter.get("/", OrderController.getUserOrders);
orderRouter.get("/past", OrderController.getUserPastOrders);
orderRouter.patch('/:orderId/status', OrderController.updateOrderStatus);
orderRouter.patch('/:orderId/feedback', OrderController.orderFeeback)


export default orderRouter