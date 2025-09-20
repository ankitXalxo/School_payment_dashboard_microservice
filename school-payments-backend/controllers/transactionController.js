// import Order from "../models/Order.js";

// export const getAllTransactions = async (req, res) => {
//   try {
//     const results = await Order.aggregate([
//       {
//         $lookup: {
//           from: "orderstatuses",
//           localField: "_id",
//           foreignField: "collect_id",
//           as: "statuses",
//         },
//       },
//       {
//         $addFields: {
//           latestStatus: { $arrayElemAt: ["$statuses", -1] },
//         },
//       },
//       {
//         $project: {
//           collect_id: "$_id",
//           school_id: 1,
//           gateway: "$gateway_name",
//           order_amount: "$latestStatus.order_amount",
//           transaction_amount: "$latestStatus.transaction_amount",
//           status: "$latestStatus.status",
//           custom_order_id: 1,
//         },
//       },
//     ]);

//     res.json(results);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// export const getTransactionsBySchool = async (req, res) => {
//   try {
//     const { schoolId } = req.params;

//     const results = await Order.aggregate([
//       { $match: { school_id: schoolId } },
//       {
//         $lookup: {
//           from: "orderstatuses",
//           localField: "_id",
//           foreignField: "collect_id",
//           as: "statuses",
//         },
//       },
//       {
//         $addFields: {
//           latestStatus: { $arrayElemAt: ["$statuses", -1] },
//         },
//       },
//       {
//         $project: {
//           collect_id: "$_id",
//           school_id: 1,
//           gateway: "$gateway_name",
//           order_amount: "$latestStatus.order_amount",
//           transaction_amount: "$latestStatus.transaction_amount",
//           status: "$latestStatus.status",
//           custom_order_id: 1,
//         },
//       },
//     ]);

//     res.json(results);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// export const getTransactionStatus = async (req, res) => {
//   try {
//     const { custom_order_id } = req.params;

//     const result = await Order.aggregate([
//       { $match: { custom_order_id } },
//       {
//         $lookup: {
//           from: "orderstatuses",
//           localField: "_id",
//           foreignField: "collect_id",
//           as: "statuses",
//         },
//       },
//       {
//         $addFields: {
//           latestStatus: { $arrayElemAt: ["$statuses", -1] },
//         },
//       },
//       {
//         $project: {
//           collect_id: "$_id",
//           school_id: 1,
//           gateway: "$gateway_name",
//           order_amount: "$latestStatus.order_amount",
//           transaction_amount: "$latestStatus.transaction_amount",
//           status: "$latestStatus.status",
//           custom_order_id: 1,
//         },
//       },
//     ]);

//     res.json(result[0] || { message: "Transaction not found" });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

//2
// controllers/transactionController.js
// import Order from "../models/Order.js";
// import OrderStatus from "../models/OrderStatus.js";
// import mongoose from "mongoose";

// /**
//  * Helper to parse ints safely
//  */
// const toInt = (v, fallback) => {
//   const n = parseInt(v, 10);
//   return Number.isNaN(n) ? fallback : n;
// };

// /**
//  * GET /api/transactions
//  * Supports:
//  *  - ?page=&limit=
//  *  - ?sort=payment_time&order=desc
//  *  - ?status=success
//  *  - ?school_id=...
//  *  - ?custom_order_id=...
//  *  - ?dateFrom=2025-01-01&dateTo=2025-01-31 (ISO dates)
//  */
// export const getAllTransactions = async (req, res) => {
//   try {
//     const page = Math.max(1, toInt(req.query.page, 1));
//     const limit = Math.max(1, toInt(req.query.limit, 20));
//     const sortField = req.query.sort || "payment_time";
//     const sortOrder = req.query.order === "desc" ? -1 : 1;

//     const filterMatch = {}; // filters applied to orders
//     if (req.query.school_id) filterMatch.school_id = req.query.school_id;
//     if (req.query.custom_order_id)
//       filterMatch.custom_order_id = req.query.custom_order_id;

//     // We'll apply status/date filters after joining latestStatus
//     const statusFilter = req.query.status;
//     const dateFrom = req.query.dateFrom ? new Date(req.query.dateFrom) : null;
//     const dateTo = req.query.dateTo ? new Date(req.query.dateTo) : null;

//     // collection name for order_statuses (ensures correct lookup target)
//     const orderStatusCollection = OrderStatus.collection.name;

//     const pipeline = [
//       // initial match on orders
//       { $match: filterMatch },

//       // lookup statuses for each order (attempt to match Order._id -> order_ref)
//       {
//         $lookup: {
//           from: orderStatusCollection,
//           let: { orderId: "$_id" },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $or: [
//                     // prefer matching by explicit ObjectId reference
//                     { $eq: ["$order_ref", "$$orderId"] },
//                     // or match collect_id that equals the stringified orderId
//                     { $eq: ["$collect_id", { $toString: "$$orderId" }] },
//                   ],
//                 },
//               },
//             },
//             // sort statuses by payment_time so latest can be picked
//             { $sort: { payment_time: 1, createdAt: 1 } },
//           ],
//           as: "statuses",
//         },
//       },

//       // add latestStatus field (last element of statuses array)
//       {
//         $addFields: {
//           latestStatus: { $arrayElemAt: ["$statuses", -1] },
//         },
//       },

//       // optional filter on status (applied to latestStatus)
//       ...(statusFilter
//         ? [{ $match: { "latestStatus.status": statusFilter } }]
//         : []),

//       // optional date range filter applied to latestStatus.payment_time (if provided)
//       ...(dateFrom || dateTo
//         ? [
//             {
//               $match: {
//                 ...(dateFrom
//                   ? { "latestStatus.payment_time": { $gte: dateFrom } }
//                   : {}),
//                 ...(dateTo
//                   ? { "latestStatus.payment_time": { $lte: dateTo } }
//                   : {}),
//               },
//             },
//           ]
//         : []),

//       // project only the required output fields (and keep timestamps if helpful)
//       {
//         $project: {
//           _id: 0,
//           collect_id: { $ifNull: ["$latestStatus.collect_id", "$collect_id"] },
//           school_id: 1,
//           gateway: "$gateway_name",
//           order_amount: "$latestStatus.order_amount",
//           transaction_amount: "$latestStatus.transaction_amount",
//           status: "$latestStatus.status",
//           custom_order_id: 1,
//           payment_time: "$latestStatus.payment_time",
//           // include raw latestStatus if needed for debugging
//           latestStatus: 1,
//         },
//       },

//       // sort by requested field (note: if sorting by payment_time we may use projection's payment_time)
//       { $sort: { [sortField]: sortOrder } },

//       // pagination using facet
//       {
//         $facet: {
//           data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
//           totalCount: [{ $count: "count" }],
//         },
//       },
//     ];

//     const agg = await Order.aggregate(pipeline).allowDiskUse(true);
//     const data = (agg[0] && agg[0].data) || [];
//     const total =
//       (agg[0] &&
//         agg[0].totalCount &&
//         agg[0].totalCount[0] &&
//         agg[0].totalCount[0].count) ||
//       0;

//     return res.json({
//       page,
//       limit,
//       total,
//       data,
//     });
//   } catch (err) {
//     console.error("getAllTransactions error:", err);
//     return res
//       .status(500)
//       .json({ message: err.message || "Internal server error" });
//   }
// };

// /**
//  * GET /api/transactions/school/:schoolId
//  * Delegates to getAllTransactions with school_id forced.
//  */
// export const getTransactionsBySchool = async (req, res) => {
//   try {
//     // Attach school_id to query and call getAllTransactions logic
//     req.query.school_id = req.params.schoolId;
//     return await getAllTransactions(req, res);
//   } catch (err) {
//     console.error("getTransactionsBySchool error:", err);
//     return res
//       .status(500)
//       .json({ message: err.message || "Internal server error" });
//   }
// };

// /**
//  * GET /api/transaction-status/:custom_order_id
//  * Returns the order + latest status for a given custom_order_id.
//  */
// export const getTransactionStatus = async (req, res) => {
//   try {
//     const { custom_order_id } = req.params;
//     if (!custom_order_id)
//       return res.status(400).json({ message: "custom_order_id required" });

//     // Find the order
//     const order = await Order.findOne({ custom_order_id }).lean();
//     if (!order) return res.status(404).json({ message: "Order not found" });

//     // Find latest status by order_ref or collect_id matching
//     const status = await OrderStatus.findOne({
//       $or: [
//         { order_ref: order._id },
//         { collect_id: order.collect_id || String(order._id) },
//       ],
//     })
//       .sort({ payment_time: -1, createdAt: -1 })
//       .lean();

//     return res.json({
//       order: {
//         _id: order._id,
//         custom_order_id: order.custom_order_id,
//         school_id: order.school_id,
//         gateway_name: order.gateway_name,
//         collect_id: order.collect_id,
//       },
//       latestStatus: status || null,
//     });
//   } catch (err) {
//     console.error("getTransactionStatus error:", err);
//     return res
//       .status(500)
//       .json({ message: err.message || "Internal server error" });
//   }
// };

//3
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
