import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import { PidgeController } from "../controllers/pidge.controller.js";

const pidgeRouter = Router();

pidgeRouter.use(authMiddleware(["user"]))

pidgeRouter.get("/quote", PidgeController.getPidgeQuote);
pidgeRouter.get('/tracking/:orderId', PidgeController.getPidgeTracking);
pidgeRouter.get("/:orderId", PidgeController.getPidgeOrderStatus);


export default pidgeRouter