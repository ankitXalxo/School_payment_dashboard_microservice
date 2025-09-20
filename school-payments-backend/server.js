import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";
import transactionRoutes from "./routes/transactions.js";

dotenv.config();
const app = express();

app.use(express.json());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/webhook", webhookRoutes);
app.use("/api/transactions", transactionRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT || 5000, () =>
      console.log(
        `Server running on port ${process.env.PORT || 5000}\nDB connected`
      )
    );
  })
  .catch((err) => console.error(err));
