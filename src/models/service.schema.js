import mongoose from "mongoose";

export const ServiceAttributesSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    code: {
      type: String,
      required: true,
    },
    scriptCode: {
        type: String,
    },
    status: {
        type: String,
    },
    attributes: {
        type: []
    }
  },
  { timestamps: true }
);


const ServiceAttributes = mongoose.model("service-attributes", ServiceAttributesSchema);

export default ServiceAttributes;
