import { Router } from "express";
import { CouponController } from "../controllers/coupon.controller.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";

const couponRouter = Router();

// ------------------------------
// Public Routes
// ------------------------------
couponRouter.get("/", CouponController.getAllCoupons);
couponRouter.get("/code/:code", CouponController.getCouponByCode);
couponRouter.get("/bulk", CouponController.bulkGetByCouponIds);
couponRouter.get("/:couponId", CouponController.getCouponById);

// ------------------------------
// Protected Routes (superAdmin only for coupon management)
// ------------------------------
couponRouter.use(authMiddleware(["superAdmin"]));

couponRouter.post("/", CouponController.createCoupon);
couponRouter.put("/:couponId", CouponController.updateCoupon);
couponRouter.delete("/:couponId", CouponController.deleteCoupon);

export default couponRouter;
