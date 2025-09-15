import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import { pidgeMiddleware } from "../../middleware/pidgeMiddleware.js";
import { PidgeController } from "../controllers/pidge.controller.js";

const pidgeRouter = Router();

pidgeRouter.post("/webhook", pidgeMiddleware, PidgeController.webHookRoute);
pidgeRouter.use(authMiddleware(["user", "martStoreAdmin", "restaurantAdmin"]))

pidgeRouter.get("/quote", PidgeController.getPidgeQuote);
pidgeRouter.get('/tracking/:orderId', PidgeController.getPidgeTracking);
pidgeRouter.get("/:orderId", PidgeController.getPidgeOrderStatus);

// Webhook route - uses pidge middleware for token verification


export default pidgeRouter