import express from "express";
import { upload } from "../middleware/multer.middleware.js";
import razorpayDemoController from "../controllers/payment/razorpay-demo.controller.js";
const router = express.Router();

router.post("/create-payment-order", razorpayDemoController.createPaymentOrder);
router.post("/validate-payment", razorpayDemoController.validatePayment);

export default router;
