import mongoose from "mongoose";

const webhookLogSchema = new mongoose.Schema(
  {
    payload: Object,
    headers: Object
  },
  { timestamps: true }
);

export default mongoose.model("WebhookLog", webhookLogSchema);
