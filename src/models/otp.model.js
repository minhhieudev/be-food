import mongoose from "mongoose";

export const OtpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
    },
    otp: {
      type: Number,
    },
    exp: {
      type: Number,
    }
  },
  { timestamps: true }
);

const Otp = mongoose.model("otp", OtpSchema);

export default Otp;
