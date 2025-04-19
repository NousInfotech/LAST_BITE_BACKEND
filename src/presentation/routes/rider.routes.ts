import { Router } from "express";
import { RiderController } from "../controllers/rider.controller.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";

const riderRouter = Router();

// ------------------------------
// Public Route - No Middleware
// ------------------------------
riderRouter.post("/", RiderController.createRider);

// ------------------------------
// Middleware for all routes below
// ------------------------------
riderRouter.use(authMiddleware(["rider"]));  // Applying the middleware to protect routes


// ------------------------------
// Authenticated Rider Routes
// ------------------------------
riderRouter.get("/:riderId", RiderController.getRiderById);
riderRouter.put("/:riderId", RiderController.updateRider);
riderRouter.delete("/:riderId", RiderController.deleteRider);

export default riderRouter;
