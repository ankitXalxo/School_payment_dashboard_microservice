// import mongoose from "mongoose";

// const orderStatusSchema = new mongoose.Schema(
//   {
//     collect_id: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
//     order_amount: Number,
//     transaction_amount: Number,
//     payment_mode: String,
//     payment_details: String,
//     bank_reference: String,
//     payment_message: String,
//     status: String,
//     error_message: String,
//     payment_time: Date,
//     provider_raw: Object
//   },
//   { timestamps: true }
// );

// export default mongoose.model("OrderStatus", orderStatusSchema);

//2 models/OrderStatus.js
// import mongoose from "mongoose";

// const OrderStatusSchema = new mongoose.Schema(
//   {
//     // store gateway collect/transaction id as string (most gateways return strings)
//     collect_id: { type: String, index: true },

//     // optional reference to Order._id if we can resolve it (useful for robust joins)
//     order_ref: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Order",
//       index: true,
//       sparse: true,
//     },

//     order_amount: { type: Number },
//     transaction_amount: { type: Number },
//     payment_mode: { type: String },
//     payment_details: { type: String },
//     bank_reference: { type: String },
//     payment_message: { type: String },
//     status: { type: String, index: true }, // success/pending/failed
//     error_message: { type: String },
//     payment_time: { type: Date },
//   },
//   { timestamps: true }
// );

// // Indexes to speed up common lookups
// OrderStatusSchema.index({ collect_id: 1 });
// OrderStatusSchema.index({ order_ref: 1 });
// OrderStatusSchema.index({ status: 1 });
// OrderStatusSchema.index({ payment_time: -1 });

// const OrderStatus = mongoose.model("OrderStatus", OrderStatusSchema);
// export default OrderStatus;

//3
import mongoose from "mongoose";

const OrderStatusSchema = new mongoose.Schema(
  {
    // Gateway collect/transaction id (string)
    collect_id: { type: String, index: true },

    // Optional reference to your internal Order
    order_ref: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      index: true,
      sparse: true,
    },

    order_amount: { type: Number },
    transaction_amount: { type: Number },

    // NEW: add gateway field
    gateway: { type: String }, // e.g., PhonePe, Cashfree, Razorpay

    payment_mode: { type: String },
    payment_details: { type: String }, // will map payemnt_details or payment_details
    bank_reference: { type: String },
    payment_message: { type: String },
    status: { type: String, index: true }, // success/pending/failed
    error_message: { type: String },
    payment_time: { type: Date },
  },
  { timestamps: true }
);

// Indexes
OrderStatusSchema.index({ collect_id: 1 });
OrderStatusSchema.index({ order_ref: 1 });
OrderStatusSchema.index({ status: 1 });
OrderStatusSchema.index({ payment_time: -1 });

const OrderStatus = mongoose.model("OrderStatus", OrderStatusSchema);
export default OrderStatus;
