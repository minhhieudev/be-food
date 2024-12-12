import mongoose from "mongoose";
export const WalletSchema = new mongoose.Schema(
  {
    balance: {
      type: Number,
      default: 0,
      required: true,
    },
    totalRecharged: {
      type: Number,
      default: 0,
      required: true,
    },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "customer" },
    status: {
      type: String,
      default: "active",
    },
  },
  { timestamps: true }
);
const roundValues = (obj) => {
  if (obj.balance !== undefined) {
    obj.balance = Math.round(obj.balance);
  }
  if (obj.totalRecharged !== undefined) {
    obj.totalRecharged = Math.round(obj.totalRecharged);
  }
};

WalletSchema.pre("save", function (next) {
  roundValues(this);
  next();
});

WalletSchema.pre("updateOne", function (next) {
  const update = this.getUpdate();
  if (update.$inc) {
    roundValues(update.$inc);
  }
  next();
});
const Wallet = mongoose.model("wallet", WalletSchema);

export default Wallet;
