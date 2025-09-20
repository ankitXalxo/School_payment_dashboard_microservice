import jwt from "jsonwebtoken";
import axios from "axios";
import mongoose from "mongoose";
import Order from "../models/Order.js";
import OrderStatus from "../models/OrderStatus.js";

export const createPayment = async (req, res) => {
  try {
    const { amount, student_info, trustee_id, custom_order_id } = req.body;

    if (!amount || !student_info) {
      return res
        .status(400)
        .json({ message: "amount and student_info are required" });
    }

    const order = await Order.create({
      school_id: process.env.SCHOOL_ID,
      trustee_id: trustee_id || null,
      student_info,
      gateway_name: "Edviron",
      custom_order_id: custom_order_id || `CO-${Date.now()}`,
    });

    await OrderStatus.create({
      collect_id: order._id,
      order_amount: amount,
      transaction_amount: 0,
      status: "INITIALIZED",
      payment_message: "initialized",
    });

    // We now send both the callback_url and webhook_url in the payload
    const payload = {
      school_id: process.env.SCHOOL_ID,
      amount: String(amount),
      callback_url: process.env.CLIENT_REDIRECT_URL,
      webhook_url: process.env.WEBHOOK_URL,
    };

    const sign = jwt.sign(payload, process.env.PG_KEY, { algorithm: "HS256" });

    const response = await axios.post(
      "https://dev-vanilla.edviron.com/erp/create-collect-request",
      { ...payload, sign },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.PAYMENT_API_KEY}`,
        },
      }
    );

    const respData = response.data;

    res.status(201).json({
      message: "Payment initialized",
      order_id: order._id,
      collect_request_id: respData.collect_request_id,
      payment_url:
        respData.Collect_request_url || respData.collect_request_url || null,
    });
  } catch (error) {
    res.status(500).json({
      message: "Payment creation failed",
      error: error.response?.data || error.message,
    });
  }
};

// listOrders and checkAndUpdateStatus functions remain unchanged
export const listOrders = async (req, res) => {
  try {
    const results = await Order.aggregate([
      {
        $lookup: {
          from: "orderstatuses",
          localField: "_id",
          foreignField: "collect_id",
          as: "statuses",
        },
      },
      {
        $addFields: {
          latestStatus: {
            $arrayElemAt: ["$statuses", -1], // pick last element
          },
        },
      },
      {
        $project: {
          statuses: 0, // remove full statuses array
        },
      },
    ]);

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const checkAndUpdateStatus = async (req, res) => {
  try {
    const { collectId } = req.params;

    const payload = {
      school_id: process.env.SCHOOL_ID,
      collect_request_id: collectId,
    };
    const sign = jwt.sign(payload, process.env.PG_KEY, { algorithm: "HS256" });

    const url = `https://dev-vanilla.edviron.com/erp/collect-request/${collectId}?school_id=${process.env.SCHOOL_ID}&sign=${sign}`;

    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${process.env.PAYMENT_API_KEY}` },
    });

    const respData = response.data;

    const statusDoc = await OrderStatus.create({
      collect_id: collectId,
      order_amount: respData.amount,
      transaction_amount: respData.amount,
      status: respData.status,
      payment_message: respData.status,
      payment_time: new Date(),
    });

    res.json({ message: "Status updated", status: statusDoc });
  } catch (err) {
    res.status(500).json({ message: err.response?.data || err.message });
  }
};
