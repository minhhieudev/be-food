import mongoose from "mongoose";

export const ServiceGroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
  },
  { timestamps: true }
);

const ServiceGroup = mongoose.model("service-group", ServiceGroupSchema);

export default ServiceGroup;
