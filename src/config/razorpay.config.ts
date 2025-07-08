import Razorpay from "razorpay";
import { config } from "./env.js";

const razorpayInstance = new Razorpay({
  key_id: config.razorpayKeyId,
  key_secret: config.razorpayKeySecret,
});

export { razorpayInstance }; 