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
