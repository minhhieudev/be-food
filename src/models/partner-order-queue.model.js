import mongoose from "mongoose";

export const PartnerOrderQueueSchema = new mongoose.Schema({
  orderID: {
    type: String,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  partnerCode: {
    type: String,
    required: true,
  },
  partnerServiceID: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    required: true,
  },
  qty: {
    type: Number,
    required: true,
  },
  retry: {
    type: Number,
    required: true,
    default: 0,
  }
});

const PartnerOrderQueue = mongoose.model( 
  "partner-order-queue",
  PartnerOrderQueueSchema
);

export default PartnerOrderQueue;
