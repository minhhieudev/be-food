import mongoose from "mongoose";

// Model lưu tỷ giá tiền tệ
export const RateSchema = new mongoose.Schema(
  {
    code: {
        type: String,
    },
    exchangeRate: {
        type: Number,
    }
  },
  { timestamps: true }
);

const Rate = mongoose.model("rate", RateSchema);

export default Rate;

