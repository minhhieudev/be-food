import mongoose from "mongoose";

export const RechargeStatusSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      default: "",
      enum: ["perfectMoney", "paypal", "bank"],
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "customer",
      required: true,
    },
    status: {
      type: String,
      default: "pendding",
      enum: ["pendding", "success", "failed"],
    },
    unit: {
      type: String,
      enum: ["USD", "VND"],
      required: true,
    },
    expectMoney: {
      type: Number,
      default: 0,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const RechargeStatus = mongoose.model("recharge-status", RechargeStatusSchema);

export default RechargeStatus;
