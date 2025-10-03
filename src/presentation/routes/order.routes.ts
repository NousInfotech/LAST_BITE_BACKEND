import { Router } from "express";
import { OrderController } from "../controllers/order.controller.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";

const orderRouter = Router();

orderRouter.use(authMiddleware(["user", "martStoreAdmin", "restaurantAdmin","superAdmin"]))

orderRouter.post("/online", OrderController.createOrder);
orderRouter.post("/verify", OrderController.verifyOrder);
orderRouter.get("/", OrderController.getUserOrders);
orderRouter.get("/all", OrderController.getAllOrders);
orderRouter.get("/past", OrderController.getUserPastOrders);
orderRouter.get("/reviews", OrderController.getUserReviews);
orderRouter.patch('/:orderId/status', OrderController.updateOrderStatus);
orderRouter.patch('/:orderId/feedback', OrderController.orderFeeback);
orderRouter.post('/:orderId/cancel', OrderController.cancelOrder);


export default orderRouter