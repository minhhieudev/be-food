import mongoose from "mongoose";
import { paymentActivityType } from "../common/service-package.enum.js";
import redisServiceIntance from "../services/redis.service.js";
import { CacheDashboardRedis } from "../common/redis.contanst.js";

export const PaymentActivitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: paymentActivityType,
    },
    amount: {
      type: Number,
      default: 0,
      required: true,
    },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "customer" },
    status: {
      type: String,
      default: "fail",
    },
    oldBalance: {
      type: Number,
      default: 0,
      required: true,
    },
    newBalance: {
      type: Number,
      default: 0,
      required: true,
    },
    wallet: { type: mongoose.Schema.Types.ObjectId, ref: "wallet" },
    description: {
      type: String,
      default: "",
    },
    transaction: {
      type: String,
      unique: true,
    },
    depositDiscountPercent: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Cache
PaymentActivitySchema.post("save", async function () {
  try {
    console.log("flag payment activity change");
    redisServiceIntance.set(
      CacheDashboardRedis.paymentActivityChange,
      { status: true },
      86400
    );
  } catch (error) {
    console.error("Error updating Redis:", error);
  }
});

const PaymentActivity = mongoose.model(
  "payment-activity",
  PaymentActivitySchema
);

export default PaymentActivity;
