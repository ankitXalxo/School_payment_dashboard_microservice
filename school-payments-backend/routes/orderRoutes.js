import express from "express";
import { createPayment, listOrders, checkAndUpdateStatus } from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create-payment", protect, createPayment);
router.get("/", protect, listOrders);
router.get("/check-status/:collectId", protect, checkAndUpdateStatus);

export default router;
