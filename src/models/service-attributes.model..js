import mongoose from "mongoose";

export const ServiceAttributesSchema = new mongoose.Schema(
  {
    label: {
      type: String,
    },
    code: {
      type: String,
    },
    description: {
      type: String,
    },
    dataType: {
      type: String,
    },
    required: {
      type: Boolean,
    },
    value: {
      type: String,
    },
  },
  { timestamps: true }
);

const ServiceAttributes = mongoose.model("service-attribute", ServiceAttributesSchema);

export default Setting;
