import express from "express";
import {
  getAllTransactions,
  getTransactionsBySchool,
  getTransactionStatus,
} from "../controllers/transactionController.js";

const router = express.Router();

router.get("/", getAllTransactions);
router.get("/school/:schoolId", getTransactionsBySchool);
router.get("/status/:custom_order_id", getTransactionStatus);

export default router;
