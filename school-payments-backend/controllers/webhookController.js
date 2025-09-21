import WebhookLog from "../models/WebhookLog.js";
import OrderStatus from "../models/OrderStatus.js";

export const handleWebhook = async (req, res) => {
  try {
    // 1. Log everything for debugging
    await WebhookLog.create({
      payload: req.body,
      headers: req.headers,
      receivedAt: new Date(),
    });

    // 2. Extract payload (Edviron wraps inside order_info)
    const payload = req.body.order_info || req.body;

    const {
      order_id,
      order_amount,
      transaction_amount,
      gateway,
      bank_reference,
      status,
      payment_mode,
      payemnt_details, // Edviron typo
      payment_details, // your expected field
      payment_message,
      payment_time,
      error_message,
    } = payload;

    // 3. Pick the right details field
    const finalPaymentDetails = payment_details || payemnt_details || null;

    // 4. Save into DB (always store collect_id as string)
    await OrderStatus.create({
      collect_id: order_id,
      order_amount,
      transaction_amount,
      payment_mode,
      payment_details: finalPaymentDetails,
      bank_reference,
      payment_message,
      status,
      error_message,
      payment_time: payment_time ? new Date(payment_time) : new Date(),
    });

    return res.status(200).json({ message: "Webhook processed successfully" });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return res
      .status(500)
      .json({ message: err.message || "Internal server error" });
  }
};
