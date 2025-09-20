// import mongoose from "mongoose";

// const orderSchema = new mongoose.Schema(
//   {
//     school_id: { type: mongoose.Schema.Types.Mixed, required: true },
//     trustee_id: { type: mongoose.Schema.Types.Mixed },
//     student_info: {
//       name: String,
//       id: String,
//       email: String
//     },
//     gateway_name: { type: String, default: "Edviron" },
//     custom_order_id: { type: String, index: true }
//   },
//   { timestamps: true }
// );

// export default mongoose.model("Order", orderSchema);

// models/Order.js
import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    school_id: { type: String, required: true, index: true }, // store as string for flexibility
    trustee_id: { type: String },
    student_info: {
      name: String,
      id: String,
      email: String,
    },
    gateway_name: String,
    custom_order_id: { type: String, index: true }, // custom client-side id
    // You can optionally store a gateway collect id here if you want
    collect_id: { type: String, index: true },
  },
  { timestamps: true }
);

// Additional useful indexes
OrderSchema.index({ school_id: 1 });
OrderSchema.index({ custom_order_id: 1 });

const Order = mongoose.model("Order", OrderSchema);
export default Order;
