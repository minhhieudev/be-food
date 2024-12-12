import mongoose from "mongoose";

export const PartnerPaymentActivitySchema = new mongoose.Schema(
  {
    orderID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "order",
      required: true,
    },
    orderCode: {
      type: String,
    },
    partnerServiceID: {
      type: String,
      required: true,
    },
    partnerCode: {
      type: String, // ongtrum, 1dg.me
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    prePartnerBalance: {
      type: Number, // refund khong lay duoc prePartnerBalance
    },
    currentPartnerBalance: {
      type: Number,
      required: true,
    },
    totalBalanceChanges: {
      type: Number,
      required: true,
    },
    type: {
      type: String, // pay, refund
    },
    note: {
      type: String,
    },
  },
  { timestamps: true }
);

const PartnerPaymentActivity = mongoose.model(
  "partner-payment-activity",
  PartnerPaymentActivitySchema
);

export default PartnerPaymentActivity;
