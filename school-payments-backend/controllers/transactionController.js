import Order from "../models/Order.js";
import OrderStatus from "../models/OrderStatus.js";
import mongoose from "mongoose";

/**
 * Helper to parse ints safely
 */
const toInt = (v, fallback) => {
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? fallback : n;
};

/**
 * GET /api/transactions
 */
export const getAllTransactions = async (req, res) => {
  try {
    const page = Math.max(1, toInt(req.query.page, 1));
    const limit = Math.max(1, toInt(req.query.limit, 20));
    const sortField = req.query.sort || "payment_time";
    const sortOrder = req.query.order === "desc" ? -1 : 1;

    const filterMatch = {};
    if (req.query.school_id) filterMatch.school_id = req.query.school_id;
    if (req.query.custom_order_id)
      filterMatch.custom_order_id = req.query.custom_order_id;

    const statusFilter = req.query.status;
    const dateFrom = req.query.dateFrom ? new Date(req.query.dateFrom) : null;
    const dateTo = req.query.dateTo ? new Date(req.query.dateTo) : null;

    const orderStatusCollection = OrderStatus.collection.name;

    const pipeline = [
      // Match orders
      { $match: filterMatch },

      // Lookup statuses
      {
        $lookup: {
          from: orderStatusCollection,
          let: { orderId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    // Match by order_ref
                    { $eq: ["$order_ref", "$$orderId"] },
                    // Match if collect_id is ObjectId
                    {
                      $and: [
                        { $eq: [{ $type: "$collect_id" }, "objectId"] },
                        { $eq: ["$collect_id", "$$orderId"] },
                      ],
                    },
                    // Match if collect_id is string
                    {
                      $and: [
                        { $eq: [{ $type: "$collect_id" }, "string"] },
                        { $eq: ["$collect_id", { $toString: "$$orderId" }] },
                      ],
                    },
                  ],
                },
              },
            },
            { $sort: { payment_time: -1, createdAt: -1 } }, // latest first
          ],
          as: "statuses",
        },
      },

      // Take latest status (first element)
      {
        $addFields: {
          latestStatus: { $arrayElemAt: ["$statuses", 0] },
        },
      },

      // Optional status filter
      ...(statusFilter
        ? [{ $match: { "latestStatus.status": statusFilter } }]
        : []),

      // Optional date range filter
      ...(dateFrom || dateTo
        ? [
            {
              $match: {
                ...(dateFrom
                  ? { "latestStatus.payment_time": { $gte: dateFrom } }
                  : {}),
                ...(dateTo
                  ? { "latestStatus.payment_time": { $lte: dateTo } }
                  : {}),
              },
            },
          ]
        : []),

      // Project required fields
      {
        $project: {
          _id: 0,
          collect_id: { $ifNull: ["$latestStatus.collect_id", "$collect_id"] },
          school_id: 1,
          gateway: { $ifNull: ["$gateway_name", "-"] },
          order_amount: "$latestStatus.order_amount",
          transaction_amount: "$latestStatus.transaction_amount",
          status: "$latestStatus.status",
          custom_order_id: 1,
          payment_time: "$latestStatus.payment_time",
        },
      },

      // Sort by requested field
      { $sort: { [sortField]: sortOrder } },

      // Pagination
      {
        $facet: {
          data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
          totalCount: [{ $count: "count" }],
        },
      },
    ];

    const agg = await Order.aggregate(pipeline).allowDiskUse(true);
    const data = (agg[0] && agg[0].data) || [];
    const total =
      (agg[0] &&
        agg[0].totalCount &&
        agg[0].totalCount[0] &&
        agg[0].totalCount[0].count) ||
      0;

    return res.json({
      page,
      limit,
      total,
      data,
    });
  } catch (err) {
    console.error("getAllTransactions error:", err);
    return res
      .status(500)
      .json({ message: err.message || "Internal server error" });
  }
};

/**
 * GET /api/transactions/school/:schoolId
 */
export const getTransactionsBySchool = async (req, res) => {
  try {
    req.query.school_id = req.params.schoolId;
    return await getAllTransactions(req, res);
  } catch (err) {
    console.error("getTransactionsBySchool error:", err);
    return res
      .status(500)
      .json({ message: err.message || "Internal server error" });
  }
};

/**
 * GET /api/transaction-status/:custom_order_id
 */
export const getTransactionStatus = async (req, res) => {
  try {
    const { custom_order_id } = req.params;
    if (!custom_order_id)
      return res.status(400).json({ message: "custom_order_id required" });

    const order = await Order.findOne({ custom_order_id }).lean();
    if (!order) return res.status(404).json({ message: "Order not found" });

    const status = await OrderStatus.findOne({
      $or: [
        { order_ref: order._id },
        { collect_id: order.collect_id || String(order._id) },
      ],
    })
      .sort({ payment_time: -1, createdAt: -1 })
      .lean();

    return res.json({
      order: {
        _id: order._id,
        custom_order_id: order.custom_order_id,
        school_id: order.school_id,
        gateway_name: order.gateway_name,
        collect_id: order.collect_id,
      },
      latestStatus: status || null,
    });
  } catch (err) {
    console.error("getTransactionStatus error:", err);
    return res
      .status(500)
      .json({ message: err.message || "Internal server error" });
  }
};
