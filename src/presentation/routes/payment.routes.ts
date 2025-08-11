import { Router, Request, Response } from "express";
import { PaymentController } from "../controllers/payment.controller.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";

const paymentRouter = Router();

// superAdmin can view/update settlement; admins can view their weekly breakdown
paymentRouter.use(authMiddleware(["superAdmin", "restaurantAdmin", "martStoreAdmin"]));

paymentRouter.get("/weekly", (req: Request, res: Response) => { void PaymentController.listWeekly(req, res); });
paymentRouter.patch("/settlement", (req: Request, res: Response) => { void PaymentController.updateSettlementStatus(req, res); });
paymentRouter.get("/details/:paymentId", (req: Request, res: Response) => { void PaymentController.getPaymentDetails(req, res); });
paymentRouter.get("/order/:orderId", (req: Request, res: Response) => { void PaymentController.getOrderDetails(req, res); });

export default paymentRouter;


