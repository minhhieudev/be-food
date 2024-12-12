import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import validator from "validator";
import { CustomerStatus } from "../common/customer.enum.js";

export const CustomerSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email");
        }
      },
    },
    password: { type: String },
    contact: {
      type: {
        phoneNumber: {
          type: String,
          default: "",
        },
        address: {
          type: String,
          default: "",
        },
        email: {
          type: String,
          default: "",
        },
      },
    },
    info: {
      type: {
        firstName: {
          type: String,
          default: "",
        },
        lastName: {
          type: String,
          default: "",
        },
        gender: {
          type: String,
          default: "male",
        },
      },
    },
    status: { type: String, default: "active", enum: CustomerStatus },
    reasonBlock: { type: String },
    lastAccessed: { type: Date, default: Date.now() },
    currency: {
      type: String,
      default: "VND",
    },
    avatar: {
      type: "string",
      default: "",
    },
    kwTopics: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "keyword-topic",
    },
    kwKeywords: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "keyword",
    },
    paymentCode: {
      type: Number,
      unique: true,
    },
    apiKey: {
      type: String,
    },
  },
  { timestamps: true }
);

CustomerSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }

  if (!this?.paymentCode) {
    this.paymentCode = await generatePaymentCode();
  }
  next();
});

CustomerSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

const generatePaymentCode = async () => {
  const lastCustomer = await Customer.findOne()
    .sort({ paymentCode: -1 })
    .lean();
  const highestPaymentCode = lastCustomer?.paymentCode || 99;
  const paymentCode = highestPaymentCode + 1;
  return paymentCode;
};

const Customer = mongoose.model("customer", CustomerSchema);

export default Customer;
