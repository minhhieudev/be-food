import mongoose from "mongoose";
import redisServiceIntance from "../services/redis.service.js";
import { CacheDashboardRedis } from "../common/redis.contanst.js";
export const OrderSchema = new mongoose.Schema(
  {
    code: String,
    servicePackage: {
      type: {
        name: String,
        code: String,
        description: String,
        orderSuccessDescription: String,
        scriptCode: String,
        scriptGroupCode: String,
        serviceValue: String,
        unit: String,
        qty: Number,
        price: Number,
        intervalTime: Number,
        mainImage: String,
        serviceGroup: {
          _id: String,
          name: String,
        },
        customerEnteredValues: {
          type: [
            {
              attributeCode: String,
              enteredValue: String,
            },
          ],
        },
        partnerOrderID: Number,
        partnerCode: String,
        partnerServiceID: Number,
        comments: {
          type: [String],
        },
        serviceCode: String,
        cost: Number,
      },
    },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "customer" },
    subscriptionID: { type: mongoose.Schema.Types.ObjectId, ref: "subdescription-meal" },
    iTags: [
       String
    ],
    status: {
      type: String,
    },
    totalPrice: {
      type: Number,
    },

    addressDelivery: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    customerName: {
      type: String,
    },



  },
  { timestamps: true }
);

function triggerOrderChange() {
  redisServiceIntance.set(
    CacheDashboardRedis.orderChange,
    { status: true },
    86400
  );
}

OrderSchema.post("save", triggerOrderChange);
OrderSchema.post("updateOne", triggerOrderChange);
OrderSchema.post("findOneAndUpdate", triggerOrderChange);

const Order = mongoose.model("order", OrderSchema);

export default Order;
