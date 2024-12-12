import mongoose from "mongoose";

export const ServiceTagchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
  },
  { timestamps: true }
);

const ServiceTag = mongoose.model("service-tag", ServiceTagchema);

export default ServiceTag;
