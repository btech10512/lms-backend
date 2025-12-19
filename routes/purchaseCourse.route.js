import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { verifyPayment } from "../controller/coursePurchase.controller.js";


import {
    createCheckoutSession,
    getAllPurchasedCourse,
    getCourseDetailWithPurchaseStatus,
} from "../controller/coursePurchase.controller.js";

const router = express.Router();
router.route("/verify-payment").post(isAuthenticated, verifyPayment);



// Razorpay
router.route("/checkout/create-checkout-session").post(isAuthenticated, createCheckoutSession);
router.route("/checkout/verify-payment").post(isAuthenticated, verifyPayment);

// Course info
router.route("/course/:courseId/detail-with-status").get(isAuthenticated, getCourseDetailWithPurchaseStatus);
router.route("/").get(isAuthenticated, getAllPurchasedCourse);

export default router;
